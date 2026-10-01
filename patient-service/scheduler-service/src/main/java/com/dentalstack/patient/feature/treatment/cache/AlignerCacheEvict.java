package com.dentalstack.patient.feature.treatment.cache;

import org.springframework.cache.annotation.CacheEvict;

public interface AlignerCacheEvict {

    @CacheEvict(value = "clearAlignersList", key = "#cacheKey")
    void evictClearAlignersListCache(String cacheKey);

    void evictProductionCache(long doctorId);

    @CacheEvict(value = "getAlignerProductionOrders", key = "{#doctorId, #status}")
    void evictSpecificCache(long doctorId, String status);
}
