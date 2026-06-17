package com.smartbarcode.config;

import com.smartbarcode.entity.User;
import com.smartbarcode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure admin user exists with correct password
        userRepository.findByUsername("admin").ifPresentOrElse(
            admin -> {
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                userRepository.save(admin);
                log.info("Admin password reset to Admin@123");
            },
            () -> {
                User admin = User.builder()
                    .username("admin")
                    .email("admin@smartbarcode.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("System Administrator")
                    .role(User.Role.ROLE_ADMIN)
                    .active(true)
                    .build();
                userRepository.save(admin);
                log.info("Admin user created with password Admin@123");
            }
        );

        // Ensure staff1 user exists with correct password
        userRepository.findByUsername("staff1").ifPresentOrElse(
            staff -> {
                staff.setPassword(passwordEncoder.encode("Staff@123"));
                userRepository.save(staff);
                log.info("Staff1 password reset to Staff@123");
            },
            () -> {
                User staff = User.builder()
                    .username("staff1")
                    .email("staff1@smartbarcode.com")
                    .password(passwordEncoder.encode("Staff@123"))
                    .fullName("John Cashier")
                    .role(User.Role.ROLE_STAFF)
                    .active(true)
                    .build();
                userRepository.save(staff);
                log.info("Staff1 user created with password Staff@123");
            }
        );

        log.info("SmartBarcode data initialization complete.");
        log.info("Login: admin / Admin@123  |  staff1 / Staff@123");
    }
}
