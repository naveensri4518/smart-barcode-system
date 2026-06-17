package com.smartbarcode.controller;

import com.smartbarcode.dto.DashboardStats;
import com.smartbarcode.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/sales/daily")
    public ResponseEntity<List<Object[]>> getDailySales(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getDailySales(days));
    }

    @GetMapping("/sales/monthly")
    public ResponseEntity<List<Object[]>> getMonthlySales(@RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(dashboardService.getMonthlySales(months));
    }
}
