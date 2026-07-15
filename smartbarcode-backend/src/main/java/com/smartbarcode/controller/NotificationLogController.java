package com.smartbarcode.controller;

import com.smartbarcode.entity.NotificationType;
import com.smartbarcode.entity.SmsLog;
import com.smartbarcode.entity.WhatsappLog;
import com.smartbarcode.repository.SmsLogRepository;
import com.smartbarcode.repository.WhatsappLogRepository;
import com.smartbarcode.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationLogController {

    @Autowired
    private SmsLogRepository smsLogRepository;

    @Autowired
    private WhatsappLogRepository whatsappLogRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/sms-logs")
    public List<SmsLog> getSmsLogs() {
        return smsLogRepository.findAll();
    }

    @GetMapping("/whatsapp-logs")
    public List<WhatsappLog> getWhatsappLogs() {
        return whatsappLogRepository.findAll();
    }

    @PostMapping("/retry/sms/{id}")
    public ResponseEntity<String> retrySms(@PathVariable Long id) {
        Optional<SmsLog> logOpt = smsLogRepository.findById(id);
        if (logOpt.isEmpty()) return ResponseEntity.notFound().build();
        SmsLog log = logOpt.get();
        notificationService.sendNotification(log.getPhone(), log.getMessage(), NotificationType.SMS, log.getInvoiceId());
        return ResponseEntity.ok("Retry triggered");
    }

    @PostMapping("/retry/whatsapp/{id}")
    public ResponseEntity<String> retryWhatsapp(@PathVariable Long id) {
        Optional<WhatsappLog> logOpt = whatsappLogRepository.findById(id);
        if (logOpt.isEmpty()) return ResponseEntity.notFound().build();
        WhatsappLog log = logOpt.get();
        notificationService.sendNotification(log.getPhone(), log.getMessage(), NotificationType.WHATSAPP, log.getInvoiceId());
        return ResponseEntity.ok("Retry triggered");
    }
}
