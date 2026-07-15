package com.smartbarcode.repository;

import com.smartbarcode.entity.ReturnLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReturnLogRepository extends JpaRepository<ReturnLog, Long> {
    List<ReturnLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
}
