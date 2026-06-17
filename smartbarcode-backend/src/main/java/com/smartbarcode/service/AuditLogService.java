package com.smartbarcode.service;

import com.smartbarcode.entity.AuditLog;
import com.smartbarcode.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long userId, String username, String action, String entityType, String entityId, String description) {
        AuditLog log = AuditLog.builder()
            .userId(userId)
            .username(username)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .description(description)
            .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
