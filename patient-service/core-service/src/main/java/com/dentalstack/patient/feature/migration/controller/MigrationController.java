package com.dentalstack.patient.feature.migration.controller;

import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.migration.service.MigrationService;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "migration api", description = "Migration APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/migration/dashboard/v1")
public class MigrationController {
    private final MigrationService migrationService;
    private final UserProfileRepository userProfileRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
}
