package com.dentalstack.patient.feature.caseinfo.service;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.caseinfo.entity.AnchorType;
import com.dentalstack.patient.feature.caseinfo.entity.RetentionType;
import com.dentalstack.patient.feature.caseinfo.repository.AnchorTypeRepository;
import com.dentalstack.patient.feature.caseinfo.repository.RetentionTypeRepository;
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
public class DefaultCaseInfoDataServiceImpl implements ApplicationRunner {

    private final Environment environment;
    private final AnchorTypeRepository anchorTypeRepository;
    private final RetentionTypeRepository retentionTypeRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (!environment.acceptsProfiles(Profiles.of("local"))) {
            generateDefaultData();
        }
    }

    private void generateDefaultData() {
        generateDefaultAnchorTypes();
        generateDefaultRetentionTypes();
    }

    private void generateDefaultAnchorTypes() {
        if (anchorTypeRepository.count() == 0) {
            log.info("Generating default anchor types...");

            saveAnchorType("Banding 2nd Molar", JawType.UPPER, true);
            saveAnchorType("TPA", JawType.UPPER, true);
            saveAnchorType("Nance palatal arch", JawType.UPPER, true);
            saveAnchorType("Add other", JawType.UPPER, false);

            saveAnchorType("Banding 2nd Molar", JawType.LOWER, true);
            saveAnchorType("Lingual arch", JawType.LOWER, true);
            saveAnchorType("Implants", JawType.LOWER, true);

            log.info("Default anchor types generated.");
        } else {
            log.info("Default anchor types are already present. Skipping generation.");
        }
    }

    private void generateDefaultRetentionTypes() {
        if (retentionTypeRepository.count() == 0) {
            log.info("Generating default retention types...");

            saveRetentionType("Hawley's", JawType.UPPER);
            saveRetentionType("Fixed Retainers", JawType.UPPER);
            saveRetentionType("Transparent retainers", JawType.UPPER);

            saveRetentionType("Hawley's", JawType.LOWER);
            saveRetentionType("Fixed Retainers", JawType.LOWER);
            saveRetentionType("Transparent retainers", JawType.LOWER);

            log.info("Default retention types generated.");
        } else {
            log.info("Default retention types are already present. Skipping generation.");
        }
    }

    private void saveAnchorType(String value, JawType jawType, boolean isCommon) {
        anchorTypeRepository.save(AnchorType.builder()
                .value(value)
                .jawType(jawType)
                .isCommon(isCommon)
                .doctorId(null)
                .build());
    }

    private void saveRetentionType(String value, JawType jawType) {
        retentionTypeRepository.save(RetentionType.builder()
                .value(value)
                .jawType(jawType)
                .isCommon(true)
                .doctorId(null)
                .build());
    }
}
