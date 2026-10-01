package com.dentalstack.patient.feature.aligner.cache;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import org.springframework.cache.annotation.CacheEvict;

public interface AlignerCacheEvict {

    void evictAllAlignerCaches(Long doctorId);

    void evictJourneyCaches(Long doctorId);

    void evictDashboardCaches(Long doctorId);

    @CacheEvict(value = "clearAlignersList", key = "#cacheKey")
    void evictClearAlignersListCache(String cacheKey);

    @CacheEvict(value = "getCategorizedAlignerActionDetailsDashboard", key = "#doctorId")
    void evictAlignerAction(Long doctorId, AlignerActionType actionType);

    @CacheEvict(value = "getWebLeadData", key = "#doctorId")
    void evictLeadData(Long doctorId);

    void evictProductionCache(long doctorId);

    @CacheEvict(value = "getAlignerProductionOrders", key = "{#doctorId, #status}")
    void evictSpecificCache(long doctorId, String status);
}
