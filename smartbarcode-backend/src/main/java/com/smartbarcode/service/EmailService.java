package com.smartbarcode.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Velora - Staff Registration OTP");
            message.setText("Hello,\n\n" +
                "You have been invited to join the Velora Staff Portal.\n" +
                "Your One Time Password (OTP) for account verification is: " + otp + "\n\n" +
                "This OTP will expire in 2 minutes.\n\n" +
                "Thank you,\nVelora Admin");

            mailSender.send(message);
            log.info("OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email to " + toEmail + ". Please check if the email address is correct.");
        }
    }

    public void sendForgotPasswordOtp(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Velora - Password Reset OTP");
            message.setText("Hello,\n\n" +
                "You have requested to reset your password.\n" +
                "Your One Time Password (OTP) is: " + otp + "\n\n" +
                "This OTP will expire in 2 minutes.\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Thank you,\nVelora Admin");

            mailSender.send(message);
            log.info("Password reset OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send Password reset OTP email to {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email.");
        }
    }

    public void sendWelcomeEmail(String toEmail, String fullName, String username, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Velora Staff Portal");
            message.setText("Hello " + fullName + ",\n\n" +
                "Your account for the Velora Staff Portal has been created successfully.\n\n" +
                "Here are your login credentials:\n" +
                "Username: " + username + "\n" +
                "Password: " + password + "\n\n" +
                "Please log in and change your password as soon as possible.\n\n" +
                "Thank you,\nVelora Admin");

            mailSender.send(message);
            log.info("Welcome email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send Welcome email to {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Account created, but failed to send the welcome email.");
        }
    }
}
