package com.smartbarcode.controller;

import com.smartbarcode.entity.Customer;
import com.smartbarcode.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.smartbarcode.entity.NotificationType;
import com.smartbarcode.service.NotificationService;
import com.smartbarcode.service.OtpService;

@RestController
@RequestMapping("/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<Customer> getCustomerByPhone(@PathVariable String phone) {
        Optional<Customer> customer = customerRepository.findByPhone(phone);
        return customer.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        Optional<Customer> existing = customerRepository.findByPhone(customer.getPhone());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        if (customer.getLoyaltyPoints() == null) {
            customer.setLoyaltyPoints(0);
        }
        if (customer.getNewbieBonusApplied() == null) {
            customer.setNewbieBonusApplied(false);
        }
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String preference = body.get("preference"); // SMS, WHATSAPP, BOTH
        if (preference == null || preference.isBlank()) preference = "SMS";

        if (phone == null || phone.isBlank()) return ResponseEntity.badRequest().build();
        
        String otp = otpService.generateAndStoreOtp(phone);
        String msg = "Velora\nYour verification code is " + otp + "\nValid for 5 minutes.\nDo not share this OTP.";
        
        NotificationType type = NotificationType.SMS;
        try { type = NotificationType.valueOf(preference.toUpperCase()); } catch (Exception ignored) {}
        
        notificationService.sendNotification(phone, msg, type, "OTP");
        
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Customer> verifyOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String otp = body.get("otp");
        String name = body.get("name");
        String preference = body.get("preference");
        if (preference == null || preference.isBlank()) preference = "SMS";
        
        if (phone == null || otp == null || name == null) return ResponseEntity.badRequest().build();
        
        if (otpService.verifyOtp(phone, otp)) {
            Customer customer = Customer.builder()
                    .name(name)
                    .phone(phone)
                    .preferredNotification(preference.toUpperCase())
                    .loyaltyPoints(0)
                    .newbieBonusApplied(false)
                    .build();
            return ResponseEntity.ok(customerRepository.save(customer));
        }
        
        return ResponseEntity.badRequest().build();
    }
}
