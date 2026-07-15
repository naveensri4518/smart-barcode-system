package com.smartbarcode.repository;

import com.smartbarcode.entity.WhatsappLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhatsappLogRepository extends JpaRepository<WhatsappLog, Long> {
    List<WhatsappLog> findByStatus(String status);
}
