package com.smartbarcode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SmartBarcodeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartBarcodeApplication.class, args);
    }
}
