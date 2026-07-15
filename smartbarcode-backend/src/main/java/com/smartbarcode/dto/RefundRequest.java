package com.smartbarcode.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class RefundRequest {
    @NotEmpty(message = "Items to refund cannot be empty")
    private List<RefundItem> items;

    @Data
    public static class RefundItem {
        @NotNull(message = "Invoice Item ID is required")
        private Long invoiceItemId;
        
        @NotNull(message = "Quantity is required")
        private Integer quantity;
        
        @NotNull(message = "Reason is required")
        private String reason;
    }
}
