package com.dentalstack.patient.feature.storage_stats.service;

import com.dentalstack.patient.feature.storage_stats.entity.StorageStats;
import com.dentalstack.patient.feature.storage_stats.repository.StorageStatsRepository;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageDefaultDataImpl implements ApplicationRunner {
    private final Environment environment;
    private final StorageStatsRepository storageStatsRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (environment.acceptsProfiles(Profiles.of("!local"))) {
            generateIfRequired();
        }
    }

    private void generateIfRequired() {
        var doctorStorage = storageStatsRepository.findAll();

        if (!doctorStorage.isEmpty()) {
            log.info("Default data is already present. Not generating again.");
            return;
        }

        List<StorageStats> defaultStats = Arrays.asList(
                StorageStats.builder().totalPatient(25).totalStorageInGb(1).build(),
                StorageStats.builder().totalPatient(50).totalStorageInGb(1).build(),
                StorageStats.builder().totalPatient(100).totalStorageInGb(5).build(),
                StorageStats.builder().totalPatient(150).totalStorageInGb(10).build(),
                StorageStats.builder().totalPatient(200).totalStorageInGb(15).build(),
                StorageStats.builder().totalPatient(250).totalStorageInGb(20).build(),
                StorageStats.builder().totalPatient(300).totalStorageInGb(25).build(),
                StorageStats.builder().totalPatient(350).totalStorageInGb(30).build(),
                StorageStats.builder().totalPatient(400).totalStorageInGb(35).build());

        try {
            storageStatsRepository.saveAll(defaultStats);
        } catch (Exception e) {
            log.info("Failed to save the storage stats data.");
        }
    }
}
