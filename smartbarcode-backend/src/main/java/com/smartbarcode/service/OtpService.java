package com.smartbarcode.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpService {

    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;

        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    // Stores email -> OtpData
    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private static final int OTP_EXPIRY_MINUTES = 2;

    public String generateAndStoreOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1000000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        otpCache.put(email, new OtpData(otp, expiry));
        log.info("Generated OTP for {}: {} (Expires in {} minutes)", email, otp, OTP_EXPIRY_MINUTES);
        return otp;
    }

    public boolean verifyOtp(String email, String otpToVerify) {
        OtpData data = otpCache.get(email);
        if (data == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(data.expiryTime)) {
            otpCache.remove(email);
            return false;
        }

        if (data.otp.equals(otpToVerify)) {
            otpCache.remove(email); // Clear after successful verification
            return true;
        }
        return false;
    }
}
