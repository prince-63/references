package com.dentalstack.patient.feature.cache.controller;

import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Cache", description = "Cache APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/cache/v1")
public class CacheController {

    private final DashboardCacheEvictService dashboardCacheEvictService;

    @PostMapping("/{profile_id}")
    public void clearDashboardCache(@PathVariable("profile_id") long profileId) {
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(profileId);
    }
}
