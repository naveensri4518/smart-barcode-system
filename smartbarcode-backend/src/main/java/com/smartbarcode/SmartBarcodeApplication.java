package com.smartbarcode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
@EnableJpaAuditing
public class SmartBarcodeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartBarcodeApplication.class, args);
    }

    @Bean
    public CommandLineRunner fixDatabaseStatusColumn(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE invoices MODIFY COLUMN status VARCHAR(50)");
                jdbcTemplate.execute("ALTER TABLE otp_verification MODIFY COLUMN phone VARCHAR(255)");
                System.out.println("Successfully updated database columns!");
            } catch (Exception e) {
                System.out.println("Could not alter database columns. " + e.getMessage());
            }
        };
    }
}
