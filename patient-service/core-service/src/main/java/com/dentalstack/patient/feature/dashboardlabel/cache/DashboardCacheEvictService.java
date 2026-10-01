package com.dentalstack.patient.feature.dashboardlabel.cache;

import com.dentalstack.patient.feature.doctor.dto.DashboardCacheEvictRequest;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

public interface DashboardCacheEvictService {
    void evictDoctorDashboardCacheForUserProfile(UserProfile ownerUserProfile);

    void evictDoctorDashboardCacheForUserProfile(long profileId);

    @Caching(
            evict = {
                @CacheEvict(
                        value = "doctorDashboardCount",
                        key = "#request.organizationId + '_' + T(String).join(',', #request.roles?.![name()])")
            })
    void evictDoctorDashboardCacheOfMultipleRoles(DashboardCacheEvictRequest request);

    @Caching(
            evict = {
                @CacheEvict(
                        value = "doctorDashboardCount",
                        key = "#request.organizationId + '_' + T(String).join(',', #request.roles?.![name()])")
            })
    void evictDoctorDashboardCache(DashboardCacheEvictRequest request);

    @Caching(
            evict = {
                @CacheEvict(
                        value = "getUnprocessedAlignerList",
                        key = "#request.organizationId + '_' + T(String).join(',', #request.roles?.![name()])")
            })
    void evictUnprocessedAlignerCacheOfMultipleRoles(DashboardCacheEvictRequest request);
}
