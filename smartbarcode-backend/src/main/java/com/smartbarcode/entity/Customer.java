package com.smartbarcode.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 15)
    private String phone;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "loyalty_points", nullable = false)
    private Integer loyaltyPoints = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "newbie_bonus_applied", nullable = false)
    private Boolean newbieBonusApplied = false;

    @Builder.Default
    @Column(name = "preferred_notification", nullable = false)
    private String preferredNotification = "SMS"; // SMS, WHATSAPP, BOTH
}
