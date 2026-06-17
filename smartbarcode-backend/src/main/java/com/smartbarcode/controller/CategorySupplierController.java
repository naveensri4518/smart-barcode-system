package com.smartbarcode.controller;

import com.smartbarcode.entity.Category;
import com.smartbarcode.entity.Supplier;
import com.smartbarcode.repository.CategoryRepository;
import com.smartbarcode.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CategorySupplierController {

    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> body) {
        Category category = Category.builder()
            .name(body.get("name"))
            .description(body.get("description"))
            .build();
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        return ResponseEntity.ok(supplierRepository.findAll());
    }

    @PostMapping("/suppliers")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Map<String, String> body) {
        Supplier supplier = Supplier.builder()
            .name(body.get("name"))
            .contactPerson(body.get("contactPerson"))
            .email(body.get("email"))
            .phone(body.get("phone"))
            .address(body.get("address"))
            .build();
        return ResponseEntity.ok(supplierRepository.save(supplier));
    }
}
