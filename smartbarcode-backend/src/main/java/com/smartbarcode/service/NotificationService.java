package com.smartbarcode.service;

import com.smartbarcode.entity.NotificationType;
import com.smartbarcode.entity.SmsLog;
import com.smartbarcode.entity.WhatsappLog;
import com.smartbarcode.repository.SmsLogRepository;
import com.smartbarcode.repository.WhatsappLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    @Value("${sms.api.key}")
    private String apiKey;

    @Value("${sms.api.url:https://api.smsmobileapi.com/sendsms/}")
    private String apiUrl;

    private final SmsLogRepository smsLogRepository;
    private final WhatsappLogRepository whatsappLogRepository;

    public void sendNotification(String toPhoneNumber, String messageBody, NotificationType type, String invoiceId) {
        if (type == NotificationType.BOTH || type == NotificationType.SMS) {
            sendInternal(toPhoneNumber, messageBody, false, invoiceId);
        }
        if (type == NotificationType.BOTH || type == NotificationType.WHATSAPP) {
            sendInternal(toPhoneNumber, messageBody, true, invoiceId);
        }
    }

    private void sendInternal(String toPhoneNumber, String messageBody, boolean isWhatsApp, String invoiceId) {
        String status = "PENDING";
        String apiResponse = null;

        try {
            RestTemplate restTemplate = new RestTemplate();
            String encodedMessage = URLEncoder.encode(messageBody, StandardCharsets.UTF_8.toString());

            // Format phone number to include country code if missing
            String formattedPhone = toPhoneNumber.trim();
            if (formattedPhone.length() == 10 && formattedPhone.matches("\\d{10}")) {
                formattedPhone = "+91" + formattedPhone;
            }

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("apikey", apiKey)
                    .queryParam("recipients", formattedPhone)
                    .queryParam("message", encodedMessage);

            if (isWhatsApp) {
                builder.queryParam("sendwa", "1");
            }

            URI uri = builder.build(true).toUri();
            apiResponse = restTemplate.getForObject(uri, String.class);
            status = "SENT";
            log.info("Notification sent via {}. Response: {}", isWhatsApp ? "WHATSAPP" : "SMS", apiResponse);
        } catch (Exception e) {
            status = "FAILED";
            apiResponse = e.getMessage();
            log.error("Failed to send notification via {}. Error: {}", isWhatsApp ? "WHATSAPP" : "SMS", e.getMessage());
        }

        // Save log
        if (isWhatsApp) {
            whatsappLogRepository.save(WhatsappLog.builder()
                    .phone(toPhoneNumber)
                    .message(messageBody)
                    .status(status)
                    .apiResponse(apiResponse)
                    .invoiceId(invoiceId)
                    .build());
        } else {
            smsLogRepository.save(SmsLog.builder()
                    .phone(toPhoneNumber)
                    .message(messageBody)
                    .status(status)
                    .apiResponse(apiResponse)
                    .invoiceId(invoiceId)
                    .build());
        }
    }
}
