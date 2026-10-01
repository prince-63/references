package com.dentalstack.patient.feature.treatment.cache.impl;

import com.dentalstack.patient.feature.treatment.cache.AlignerCacheEvict;
import com.dentalstack.patient.feature.treatment.enums.production.ProductionStatus;
import java.util.EnumSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlignerCacheEvictImpl implements AlignerCacheEvict {
    @Override
    public void evictClearAlignersListCache(String cacheKey) {}

    @Override
    public void evictProductionCache(long doctorId) {
        var statuses = EnumSet.allOf(ProductionStatus.class);
        if (!statuses.isEmpty()) {
            statuses.forEach(status -> {
                String statusKey = status.toString();
                evictSpecificCache(doctorId, statusKey);
            });
        }
    }

    @Override
    public void evictSpecificCache(long doctorId, String status) {}
}
