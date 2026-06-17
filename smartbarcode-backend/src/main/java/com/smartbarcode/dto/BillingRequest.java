package com.smartbarcode.dto;

import com.smartbarcode.entity.Invoice;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class BillingRequest {
    private String customerName;
    private String customerPhone;

    @NotEmpty(message = "Cart items cannot be empty")
    private List<CartItem> items;

    private Invoice.DiscountType discountType = Invoice.DiscountType.FLAT;
    private BigDecimal discountValue = BigDecimal.ZERO;
    private BigDecimal taxRate = new BigDecimal("18");
    private Invoice.PaymentMethod paymentMethod = Invoice.PaymentMethod.CASH;
    private String notes;

    @Data
    public static class CartItem {
        @NotNull
        private Long productId;
        @NotNull
        private Integer quantity;
        @NotNull
        private BigDecimal unitPrice;
    }
}
