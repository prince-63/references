package com.dentalstack.doctor.cache.impl;

import com.dentalstack.doctor.cache.DashboardCacheEvictService;
import com.dentalstack.doctor.dto.dashboard.DashboardCacheEvictRequest;
import com.dentalstack.doctor.entity.user.Role;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.doctor.DoctorRole;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardCacheEvictServiceImpl implements DashboardCacheEvictService {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void evictDoctorDashboardCacheForUserProfile(UserProfile ownerUserProfile) {
        if (ownerUserProfile == null || ownerUserProfile.getOrganization() == null) {
            return;
        }

        Long organizationId = ownerUserProfile.getOrganization().getId();

        List<DoctorRole> doctorRoles = convertRolesToDoctorRoles(ownerUserProfile.getRoles());

        evictDoctorDashboardCache(DashboardCacheEvictRequest.builder()
                .organizationId(organizationId)
                .roles(doctorRoles)
                .build());

        evictDoctorDashboardCacheOfMultipleRoles(DashboardCacheEvictRequest.builder()
                .organizationId(organizationId)
                .roles(Arrays.asList(DoctorRole.values()))
                .build());
    }

    @Override
    public void evictDoctorDashboardCache(DashboardCacheEvictRequest request) {
        if (request.getOrganizationId() != null) {
            // Get the actual cache name that Spring uses
            Cache cache = cacheManager.getCache("doctorDashboardCount");

            if (cache == null) {

                evictRedisKeys(request.getOrganizationId());
                return;
            }

            if (cache instanceof org.springframework.cache.concurrent.ConcurrentMapCache concurrentMapCache) {
            } else {
                // Try to use direct Redis commands as a fallback
                evictRedisKeys(request.getOrganizationId());
            }
        }
    }

    private void evictRedisKeys(Long organizationId) {
        try {
            String keyPattern = "doctorDashboardCount::" + organizationId + "_*";

            Set<String> keys = redisTemplate.keys(keyPattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            } else {
            }
        } catch (Exception e) {
        }
    }

    private List<DoctorRole> convertRolesToDoctorRoles(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return Collections.emptyList();
        }

        return roles.stream()
                .map(role -> {
                    try {
                        return DoctorRole.valueOf(role.getName());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    @Caching(evict = {@CacheEvict(value = "doctorDashboardCount", key = "#request.organizationId + '_*'")})
    public void evictDoctorDashboardCacheOfMultipleRoles(DashboardCacheEvictRequest request) {}
}
