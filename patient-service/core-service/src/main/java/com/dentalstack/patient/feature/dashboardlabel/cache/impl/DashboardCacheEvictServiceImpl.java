package com.dentalstack.patient.feature.dashboardlabel.cache.impl;

import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.dto.DashboardCacheEvictRequest;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
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
    private final UserProfileRepository userProfileRepository;

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
        evictUnprocessedAlignerCacheOfMultipleRoles(DashboardCacheEvictRequest.builder()
                .organizationId(organizationId)
                .roles(Arrays.asList(DoctorRole.values()))
                .build());
    }

    @Override
    public void evictDoctorDashboardCacheForUserProfile(long profileId) {

        var userProfile =
                userProfileRepository.findByIdWithOrgAndDoctorAndUser(profileId).orElseThrow();
        if (userProfile.getOrganization() == null) {
            return;
        }

        Long organizationId = userProfile.getOrganization().getId();

        List<DoctorRole> doctorRoles = convertRolesToDoctorRoles(userProfile.getRoles());

        evictDoctorDashboardCache(DashboardCacheEvictRequest.builder()
                .organizationId(organizationId)
                .roles(doctorRoles)
                .build());

        evictDoctorDashboardCacheOfMultipleRoles(DashboardCacheEvictRequest.builder()
                .organizationId(organizationId)
                .roles(Arrays.asList(DoctorRole.values()))
                .build());
        evictUnprocessedAlignerCacheOfMultipleRoles(DashboardCacheEvictRequest.builder()
                .organizationId(organizationId)
                .roles(Arrays.asList(DoctorRole.values()))
                .build());
    }

    @Override
    public void evictDoctorDashboardCache(DashboardCacheEvictRequest request) {
        if (request.getOrganizationId() != null) {

            Cache cache = cacheManager.getCache("doctorDashboardCount");

            if (cache == null) {

                evictRedisKeys(request.getOrganizationId());
                evictUnprocessedAlignerRedisKeys(request.getOrganizationId());
                return;
            }

            Cache unprocessedAlignerCache = cacheManager.getCache("getUnprocessedAlignerList");

            if (unprocessedAlignerCache == null) {

                evictRedisKeys(request.getOrganizationId());
                evictUnprocessedAlignerRedisKeys(request.getOrganizationId());

                return;
            }

            if (cache instanceof org.springframework.cache.concurrent.ConcurrentMapCache concurrentMapCache) {
            } else {

                evictRedisKeys(request.getOrganizationId());
                evictUnprocessedAlignerRedisKeys(request.getOrganizationId());
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

    private void evictUnprocessedAlignerRedisKeys(Long organizationId) {
        try {
            String keyPattern = "getUnprocessedAlignerList::" + organizationId + "_*";

            Set<String> keys = redisTemplate.keys(keyPattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            } else {
            }
        } catch (Exception ignored) {
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
    @Caching(
            evict = {
                @CacheEvict(
                        value = "doctorDashboardCount",
                        key = "#request.organizationId + '_' + T(String).join(',', #request.roles?.![name()])")
            })
    public void evictDoctorDashboardCacheOfMultipleRoles(DashboardCacheEvictRequest request) {}

    @Override
    @Caching(
            evict = {
                @CacheEvict(
                        value = "getUnprocessedAlignerList",
                        key = "#request.organizationId + '_' + T(String).join(',', #request.roles?.![name()])")
            })
    public void evictUnprocessedAlignerCacheOfMultipleRoles(DashboardCacheEvictRequest request) {}
}
