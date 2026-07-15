package com.smartbarcode.service;

import com.smartbarcode.entity.OtpVerification;
import com.smartbarcode.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final Random random = new Random();
    private static final int OTP_EXPIRY_MINUTES = 5;

    public String generateAndStoreOtp(String phoneOrEmail) {
        String otp = String.format("%06d", random.nextInt(1000000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        
        OtpVerification verification = OtpVerification.builder()
                .phone(phoneOrEmail)
                .otpHash(hashOtp(otp))
                .attemptCount(0)
                .expiresAt(expiry)
                .verified(false)
                .build();
                
        otpRepository.save(verification);
        return otp; // Return plain text ONCE for the Notification Service to send it
    }

    public boolean verifyOtp(String phoneOrEmail, String otpToVerify) {
        Optional<OtpVerification> optData = otpRepository.findTopByPhoneOrderByCreatedAtDesc(phoneOrEmail);
        
        if (optData.isEmpty()) {
            return false;
        }

        OtpVerification data = optData.get();
        
        if (data.getVerified()) {
            return false; // Already verified
        }

        if (LocalDateTime.now().isAfter(data.getExpiresAt()) || data.getAttemptCount() >= 5) {
            return false;
        }

        String hashedInput = hashOtp(otpToVerify);

        if (data.getOtpHash().equals(hashedInput)) {
            data.setVerified(true);
            otpRepository.save(data);
            return true;
        } else {
            data.setAttemptCount(data.getAttemptCount() + 1);
            if (data.getAttemptCount() >= 5) {
                data.setExpiresAt(LocalDateTime.now()); // Invalidate
            }
            otpRepository.save(data);
            return false;
        }
    }

    private String hashOtp(String plainOtp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(plainOtp.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
