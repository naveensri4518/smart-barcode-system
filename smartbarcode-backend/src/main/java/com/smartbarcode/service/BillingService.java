package com.smartbarcode.service;

import com.smartbarcode.dto.BillingRequest;
import com.smartbarcode.entity.*;
import com.smartbarcode.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final ReturnLogRepository returnLogRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final GeminiAiService aiService;

    @Transactional
    public Invoice generateInvoice(BillingRequest request, String username) {
        User staff = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = null;
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().isEmpty()) {
            customer = customerRepository.findByPhone(request.getCustomerPhone())
                .orElseGet(() -> {
                    Customer newCustomer = Customer.builder()
                        .name(request.getCustomerName() != null && !request.getCustomerName().isEmpty() ? request.getCustomerName() : "Guest")
                        .phone(request.getCustomerPhone())
                        .loyaltyPoints(0)
                        .newbieBonusApplied(false)
                        .preferredNotification("SMS")
                        .build();
                    return customerRepository.save(newCustomer);
                });
        }
        
        BigDecimal pointsDiscount = BigDecimal.ZERO;
        if (customer != null && Boolean.TRUE.equals(request.getRedeemPoints()) && customer.getLoyaltyPoints() > 0) {
            pointsDiscount = new BigDecimal(customer.getLoyaltyPoints());
            customer.setLoyaltyPoints(0);
        }

        // Validate stock and build items
        List<InvoiceItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (BillingRequest.CartItem cartItem : request.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProductId()));

            if (product.getCurrentStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName() +
                    ". Available: " + product.getCurrentStock());
            }

            BigDecimal unitPrice = product.getSellingPrice();
            boolean ecoSaverApplied = false;
            
            if (product.getExpiryDate() != null) {
                long daysToExpiry = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), product.getExpiryDate());
                if (daysToExpiry >= 0 && daysToExpiry <= 3) {
                    unitPrice = unitPrice.multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP);
                    ecoSaverApplied = true;
                }
            }

            BigDecimal itemSubtotal = unitPrice.multiply(new BigDecimal(cartItem.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            InvoiceItem item = InvoiceItem.builder()
                .product(product)
                .productName(product.getName() + (ecoSaverApplied ? " 🍃(Eco-Saver)" : ""))
                .productBarcode(product.getBarcode())
                .quantity(cartItem.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(itemSubtotal)
                .ecoSaverApplied(ecoSaverApplied)
                .build();
            items.add(item);
        }

        // Calculate discount
        BigDecimal discountAmount = pointsDiscount;
        if (request.getDiscountValue() != null && request.getDiscountValue().compareTo(BigDecimal.ZERO) > 0) {
            if (request.getDiscountType() == Invoice.DiscountType.PERCENTAGE) {
                discountAmount = discountAmount.add(subtotal.multiply(request.getDiscountValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
            } else {
                discountAmount = discountAmount.add(request.getDiscountValue());
            }
        }

        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        
        // Calculate item-level tax
        BigDecimal totalTaxAmount = BigDecimal.ZERO;
        for (InvoiceItem item : items) {
            BigDecimal itemDiscount = BigDecimal.ZERO;
            if (subtotal.compareTo(BigDecimal.ZERO) > 0 && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                itemDiscount = item.getSubtotal().divide(subtotal, 4, RoundingMode.HALF_UP).multiply(discountAmount);
            }
            BigDecimal itemNet = item.getSubtotal().subtract(itemDiscount);
            
            BigDecimal itemTaxRate = item.getProduct().getTaxRate() != null ? item.getProduct().getTaxRate() : new BigDecimal("18.00");
            BigDecimal itemTax = itemNet.multiply(itemTaxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            
            item.setTaxRate(itemTaxRate);
            item.setTaxAmount(itemTax);
            totalTaxAmount = totalTaxAmount.add(itemTax);
        }
        
        BigDecimal total = afterDiscount.add(totalTaxAmount);

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
            .invoiceNumber(invoiceNumber)
            .customer(customer)
            .customerName(request.getCustomerName())
            .customerPhone(request.getCustomerPhone())
            .subtotal(subtotal)
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .discountAmount(discountAmount)
            .taxRate(null) // Global tax rate is no longer applicable
            .taxAmount(totalTaxAmount)
            .total(total)
            .paymentMethod(request.getPaymentMethod())
            .status(Invoice.InvoiceStatus.COMPLETED)
            .notes(request.getNotes())
            .createdBy(staff)
            .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Save items and reduce stock
        for (int i = 0; i < items.size(); i++) {
            InvoiceItem item = items.get(i);
            item.setInvoice(savedInvoice);
            invoiceItemRepository.save(item);

            // Reduce stock
            Product product = item.getProduct();
            int oldStock = product.getCurrentStock();
            int newStock = oldStock - item.getQuantity();
            product.setCurrentStock(newStock);
            productRepository.save(product);

            // Log inventory change
            InventoryLog invLog = InventoryLog.builder()
                .product(product)
                .action(InventoryLog.InventoryAction.SALE)
                .quantityChanged(-item.getQuantity())
                .oldStock(oldStock)
                .newStock(newStock)
                .referenceId(invoiceNumber)
                .notes("Sale via invoice " + invoiceNumber)
                .userId(staff.getId())
                .build();
            inventoryLogRepository.save(invLog);
        }

        // Fetch AI Recommendation for receipt
        String aiRec = "";
        try {
            List<String> productNames = new ArrayList<>();
            for (InvoiceItem i : savedInvoice.getItems()) {
                productNames.add(i.getProduct().getName());
            }
            String rawRec = aiService.getProductRecommendations(productNames);
            if (rawRec != null && !rawRec.isBlank()) {
                String topRec = rawRec.split(",")[0].trim();
                aiRec = "\n\n⭐ AI Recommendation\nBuy " + topRec + "\nGet 20% OFF";
            }
        } catch (Exception e) {
            log.warn("Failed to generate AI recommendation for receipt", e);
        }

        // Loyalty & Notifications
        if (customer != null) {
            int earnedPoints = total.divide(new BigDecimal("10"), 0, RoundingMode.DOWN).intValue();
            int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
            
            boolean isNewbie = false;
            if (customer.getNewbieBonusApplied() != null && !customer.getNewbieBonusApplied()) {
                isNewbie = true;
                earnedPoints += 50; // Newbie bonus!
                customer.setNewbieBonusApplied(true);
            }
            
            int newTotalPoints = currentPoints + earnedPoints - (request.getRedeemPoints() ? currentPoints : 0);
            customer.setLoyaltyPoints(newTotalPoints);
            customerRepository.save(customer);
            
            String msg;
            if (isNewbie) {
                msg = "🎉 Welcome to Velora\n" +
                      "You received\n" +
                      "50 Bonus Points\n" +
                      "Current Balance\n" +
                      newTotalPoints + "\n" +
                      "Enjoy shopping with Velora." + aiRec;
            } else {
                int redeemed = request.getRedeemPoints() ? Math.min(total.intValue(), currentPoints) : 0;
                msg = "🛒 VELORA RETAIL\n" +
                      "Invoice : " + invoiceNumber + "\n" +
                      "Amount : ₹" + total + "\n" +
                      "Earned : +" + earnedPoints + " Points\n" +
                      "Current Loyalty : " + newTotalPoints +
                      aiRec + "\n\n" +
                      "Thank you for shopping with Velora ❤️";
            }
            
            String pref = customer.getPreferredNotification();
            if (pref == null) pref = "SMS";
            
            NotificationType type = NotificationType.SMS;
            try { type = NotificationType.valueOf(pref.toUpperCase()); } catch (Exception ignored) {}
            
            notificationService.sendNotification(customer.getPhone(), msg, type, invoiceNumber);
        }

        auditLogService.log(staff.getId(), staff.getUsername(), "INVOICE_GENERATED", "INVOICE",
            savedInvoice.getId().toString(), "Invoice " + invoiceNumber + " generated. Total: ₹" + total);

        // Re-fetch to get fully populated invoice with all items
        return invoiceRepository.findById(savedInvoice.getId())
            .orElse(savedInvoice);
    }

    public Page<Invoice> getAll(String search, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return invoiceRepository.filterInvoices(search, startDate, endDate, pageable);
    }

    public Invoice getById(Long id) {
        return invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    @Transactional
    public Invoice refundInvoice(Long invoiceId, String username) {
        User staff = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == Invoice.InvoiceStatus.REFUNDED) {
            throw new RuntimeException("Invoice is already refunded");
        }

        // Add items back to stock
        for (InvoiceItem item : invoice.getItems()) {
            Product product = item.getProduct();
            int oldStock = product.getCurrentStock();
            int newStock = oldStock + item.getQuantity();
            product.setCurrentStock(newStock);
            productRepository.save(product);

            InventoryLog invLog = InventoryLog.builder()
                .product(product)
                .action(InventoryLog.InventoryAction.STOCK_IN)
                .quantityChanged(item.getQuantity())
                .oldStock(oldStock)
                .newStock(newStock)
                .referenceId(invoice.getInvoiceNumber())
                .notes("Refund via invoice " + invoice.getInvoiceNumber())
                .userId(staff.getId())
                .build();
            inventoryLogRepository.save(invLog);
        }

        invoice.setRefundedAmount(invoice.getTotal());
        invoice.setStatus(Invoice.InvoiceStatus.REFUNDED);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        auditLogService.log(staff.getId(), staff.getUsername(), "INVOICE_REFUNDED", "INVOICE",
            savedInvoice.getId().toString(), "Invoice " + invoice.getInvoiceNumber() + " refunded. Total: ₹" + invoice.getTotal());

        return savedInvoice;
    }

    @Transactional
    public Invoice refundItems(Long invoiceId, String username, com.smartbarcode.dto.RefundRequest request) {
        User staff = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == Invoice.InvoiceStatus.REFUNDED) {
            throw new RuntimeException("Invoice is already fully refunded");
        }

        BigDecimal totalRefundAmount = BigDecimal.ZERO;

        for (com.smartbarcode.dto.RefundRequest.RefundItem reqItem : request.getItems()) {
            InvoiceItem item = invoice.getItems().stream()
                .filter(i -> i.getId().equals(reqItem.getInvoiceItemId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invoice item not found: " + reqItem.getInvoiceItemId()));

            int currentReturned = item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0;
            int availableToReturn = item.getQuantity() - currentReturned;
            if (reqItem.getQuantity() > availableToReturn) {
                throw new RuntimeException("Cannot return more than purchased for item: " + item.getProductName());
            }

            BigDecimal itemTotalPaid = item.getSubtotal().add(item.getTaxAmount() != null ? item.getTaxAmount() : BigDecimal.ZERO);
            BigDecimal invDiscount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : BigDecimal.ZERO;
            if (invDiscount.compareTo(BigDecimal.ZERO) > 0 && invoice.getSubtotal() != null && invoice.getSubtotal().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal itemDiscount = item.getSubtotal().divide(invoice.getSubtotal(), 4, RoundingMode.HALF_UP).multiply(invDiscount);
                itemTotalPaid = itemTotalPaid.subtract(itemDiscount);
            }
            BigDecimal unitRefundAmount = itemTotalPaid.divide(new BigDecimal(item.getQuantity()), 2, RoundingMode.HALF_UP);
            BigDecimal refundAmount = unitRefundAmount.multiply(new BigDecimal(reqItem.getQuantity()));

            totalRefundAmount = totalRefundAmount.add(refundAmount);

            item.setReturnedQuantity(currentReturned + reqItem.getQuantity());
            invoiceItemRepository.save(item);

            Product product = item.getProduct();
            
            String reason = reqItem.getReason() != null ? reqItem.getReason().toLowerCase() : "";
            boolean isDamaged = reason.contains("damage") || 
                                reason.contains("defect") ||
                                reason.contains("expire") ||
                                reason.contains("waste") ||
                                reason.contains("broken");

            if (!isDamaged) {
                int oldStock = product.getCurrentStock();
                int newStock = oldStock + reqItem.getQuantity();
                product.setCurrentStock(newStock);
                productRepository.save(product);

                InventoryLog invLog = InventoryLog.builder()
                    .product(product)
                    .action(InventoryLog.InventoryAction.STOCK_IN)
                    .quantityChanged(reqItem.getQuantity())
                    .oldStock(oldStock)
                    .newStock(newStock)
                    .referenceId(invoice.getInvoiceNumber())
                    .notes("Partial Return via invoice " + invoice.getInvoiceNumber() + ". Reason: " + reqItem.getReason())
                    .userId(staff.getId())
                    .build();
                inventoryLogRepository.save(invLog);
            }

            ReturnLog returnLog = ReturnLog.builder()
                .invoice(invoice)
                .product(product)
                .quantity(reqItem.getQuantity())
                .refundAmount(refundAmount)
                .reason(reqItem.getReason())
                .createdBy(staff)
                .build();
            returnLogRepository.save(returnLog);
        }

        BigDecimal currentRefunded = invoice.getRefundedAmount() != null ? invoice.getRefundedAmount() : BigDecimal.ZERO;
        invoice.setRefundedAmount(currentRefunded.add(totalRefundAmount));
        
        if (invoice.getRefundedAmount().compareTo(invoice.getTotal()) >= 0 || 
            invoice.getItems().stream().allMatch(i -> (i.getReturnedQuantity() != null ? i.getReturnedQuantity() : 0) == i.getQuantity())) {
            invoice.setStatus(Invoice.InvoiceStatus.REFUNDED);
        } else {
            invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_REFUNDED);
        }
        
        Invoice savedInvoice = invoiceRepository.save(invoice);

        auditLogService.log(staff.getId(), staff.getUsername(), "INVOICE_PARTIALLY_REFUNDED", "INVOICE",
            savedInvoice.getId().toString(), "Invoice " + invoice.getInvoiceNumber() + " items refunded. Amount: ₹" + totalRefundAmount);

        return savedInvoice;
    }

    public Map<String, Object> getShiftSummary(String username) {
        User staff = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        List<Invoice> todaysInvoices = invoiceRepository.findByCreatedByIdAndCreatedAtBetween(staff.getId(), startOfDay, endOfDay);
        
        long totalBills = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal cashTotal = BigDecimal.ZERO;
        BigDecimal cardTotal = BigDecimal.ZERO;
        BigDecimal upiTotal = BigDecimal.ZERO;
        BigDecimal otherTotal = BigDecimal.ZERO;

        for (Invoice inv : todaysInvoices) {
            if (inv.getStatus() == Invoice.InvoiceStatus.COMPLETED || inv.getStatus() == Invoice.InvoiceStatus.PARTIALLY_REFUNDED) {
                totalBills++;
                // If partially refunded, the revenue is total - refundedAmount
                BigDecimal netRevenue = inv.getTotal().subtract(inv.getRefundedAmount() != null ? inv.getRefundedAmount() : BigDecimal.ZERO);
                totalRevenue = totalRevenue.add(netRevenue);
                
                switch (inv.getPaymentMethod()) {
                    case CASH: cashTotal = cashTotal.add(netRevenue); break;
                    case CARD: cardTotal = cardTotal.add(netRevenue); break;
                    case UPI: upiTotal = upiTotal.add(netRevenue); break;
                    case OTHER: otherTotal = otherTotal.add(netRevenue); break;
                }
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("date", startOfDay.toLocalDate().toString());
        summary.put("staffName", staff.getFullName());
        summary.put("totalBills", totalBills);
        summary.put("totalRevenue", totalRevenue);
        summary.put("cashTotal", cashTotal);
        summary.put("cardTotal", cardTotal);
        summary.put("upiTotal", upiTotal);
        summary.put("otherTotal", otherTotal);
        
        return summary;
    }

    public List<ReturnLog> getReturnLogs(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
        if (endDate == null) endDate = LocalDateTime.now();
        return returnLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
    }

    private String generateInvoiceNumber() {
        Long maxId = invoiceRepository.findMaxId();
        long nextNum = (maxId == null ? 0 : maxId) + 1;
        return String.format("INV-%d-%06d", java.time.Year.now().getValue(), nextNum);
    }
}
