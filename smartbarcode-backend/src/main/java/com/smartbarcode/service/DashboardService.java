package com.smartbarcode.service;

import com.smartbarcode.dto.DashboardStats;
import com.smartbarcode.entity.User;
import com.smartbarcode.repository.InvoiceItemRepository;
import com.smartbarcode.repository.InvoiceRepository;
import com.smartbarcode.repository.ProductRepository;
import com.smartbarcode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final UserRepository userRepository;

    public DashboardStats getStats() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);
        LocalDateTime startOfMonth = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIDNIGHT);

        List<Object[]> staffSalesRaw = invoiceRepository.getStaffSalesSince(startOfDay);
        Map<String, BigDecimal> staffSalesMap = new HashMap<>();
        for (Object[] row : staffSalesRaw) {
            staffSalesMap.put((String) row[0], (BigDecimal) row[1]);
        }

        return DashboardStats.builder()
            .totalProducts(productRepository.countActiveProducts())
            .totalStock(productRepository.calculateTotalStock())
            .totalInventoryValue(productRepository.calculateTotalInventoryValue())
            .lowStockProducts(productRepository.countLowStockProducts())
            .outOfStockProducts(productRepository.countOutOfStockProducts())
            .todayRevenue(invoiceRepository.sumRevenueSince(startOfDay))
            .yesterdayRevenue(invoiceRepository.sumRevenueBetween(startOfYesterday, startOfDay))
            .monthlyRevenue(invoiceRepository.sumRevenueSince(startOfMonth))
            .totalInvoices(invoiceRepository.countCompletedInvoices())
            .activeStaff(userRepository.countByRoleAndActiveTrue(User.Role.ROLE_STAFF))
            .staffSalesToday(staffSalesMap)
            .expiringProducts(productRepository.findExpiringProducts(LocalDate.now().plusDays(30)))
            .build();
    }

    public List<Object[]> getDailySales(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return invoiceRepository.getDailySalesReport(startDate);
    }

    public List<Object[]> getMonthlySales(int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
        return invoiceRepository.getMonthlySalesReport(startDate);
    }

    public Map<String, String> getAiPrediction() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> sales = invoiceItemRepository.getProductSalesVelocity(thirtyDaysAgo);
        
        java.util.List<String> depletionWarnings = new java.util.ArrayList<>();
        
        for(Object[] row : sales) {
            String name = (String) row[1];
            Integer currentStock = (Integer) row[2];
            Long totalQtySold = (Long) row[3];
            
            if (currentStock == null) currentStock = 0;
            if (totalQtySold == null) totalQtySold = 0L;
            
            double dailyVelocity = totalQtySold / 30.0;
            if (dailyVelocity > 0) {
                double daysToDepletion = currentStock / dailyVelocity;
                if (daysToDepletion <= 7 && daysToDepletion >= 0) {
                    depletionWarnings.add("'" + name + "' (in ~" + Math.round(daysToDepletion) + " days)");
                }
            }
        }
        
        String message;
        if (depletionWarnings.isEmpty()) {
            message = "Based on recent velocity, inventory levels are optimal. No immediate restocks required.";
        } else {
            message = "Based on recent velocity, we recommend restocking " + String.join(", ", depletionWarnings) + ".";
        }
        
        return Map.of("prediction", message);
    }
}
