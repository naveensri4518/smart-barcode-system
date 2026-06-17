package com.smartbarcode.controller;

import com.smartbarcode.entity.Setting;
import com.smartbarcode.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SettingsController {

    private final SettingRepository settingRepository;

    @GetMapping
    public ResponseEntity<List<Setting>> getAll() {
        return ResponseEntity.ok(settingRepository.findAll());
    }

    @PutMapping("/{key}")
    public ResponseEntity<Setting> update(@PathVariable String key, @RequestBody Map<String, String> body) {
        Setting setting = settingRepository.findBySettingKey(key)
            .orElse(Setting.builder().settingKey(key).build());
        setting.setSettingValue(body.get("value"));
        return ResponseEntity.ok(settingRepository.save(setting));
    }

    @PutMapping("/bulk")
    public ResponseEntity<List<Setting>> updateBulk(@RequestBody Map<String, String> settings) {
        settings.forEach((key, value) -> {
            Setting setting = settingRepository.findBySettingKey(key)
                .orElse(Setting.builder().settingKey(key).build());
            setting.setSettingValue(value);
            settingRepository.save(setting);
        });
        return ResponseEntity.ok(settingRepository.findAll());
    }
}
