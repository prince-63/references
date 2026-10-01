package com.dentalstack.doctor.cache;

import com.dentalstack.doctor.dto.dashboard.DashboardCacheEvictRequest;
import com.dentalstack.doctor.entity.user.UserProfile;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

public interface DashboardCacheEvictService {
    void evictDoctorDashboardCacheForUserProfile(UserProfile ownerUserProfile);

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
}
