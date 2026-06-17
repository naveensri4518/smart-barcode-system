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

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public Invoice generateInvoice(BillingRequest request, String username) {
        User staff = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

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

            BigDecimal itemSubtotal = cartItem.getUnitPrice()
                .multiply(new BigDecimal(cartItem.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            InvoiceItem item = InvoiceItem.builder()
                .product(product)
                .productName(product.getName())
                .productBarcode(product.getBarcode())
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .subtotal(itemSubtotal)
                .build();
            items.add(item);
        }

        // Calculate discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getDiscountValue() != null && request.getDiscountValue().compareTo(BigDecimal.ZERO) > 0) {
            if (request.getDiscountType() == Invoice.DiscountType.PERCENTAGE) {
                discountAmount = subtotal.multiply(request.getDiscountValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            } else {
                discountAmount = request.getDiscountValue();
            }
        }

        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("18");
        BigDecimal taxAmount = afterDiscount.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal total = afterDiscount.add(taxAmount);

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
            .invoiceNumber(invoiceNumber)
            .customerName(request.getCustomerName())
            .customerPhone(request.getCustomerPhone())
            .subtotal(subtotal)
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .discountAmount(discountAmount)
            .taxRate(taxRate)
            .taxAmount(taxAmount)
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

    private String generateInvoiceNumber() {
        Long maxId = invoiceRepository.findMaxId();
        long nextNum = (maxId == null ? 0 : maxId) + 1;
        return String.format("INV-%d-%06d", java.time.Year.now().getValue(), nextNum);
    }
}
