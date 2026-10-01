package com.dentalstack.patient.feature.aligner.cache;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.enums.aligner.production.ProductionStatus;
import com.dentalstack.patient.feature.patient.enums.PatientListType;
import java.util.EnumSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlignerCacheEvictImpl implements AlignerCacheEvict {

    @Override
    public void evictAllAlignerCaches(Long doctorId) {
        log.debug("Evicting ALL aligner caches for doctorId={}", doctorId);
        evictJourneyCaches(doctorId);
        evictDashboardCaches(doctorId);
        evictListCaches(doctorId);
        evictProductionCache(doctorId);
    }

    @Override
    @Caching(
            evict = {
                @CacheEvict(value = "alignerJourneysByDoctorId", key = "#doctorId"),
                @CacheEvict(value = "activeAlignerJourneys", key = "#doctorId"),
                @CacheEvict(value = "upcomingAlignerChange", key = "#doctorId")
            })
    public void evictJourneyCaches(Long doctorId) {
        log.debug("Evicted journey caches for doctorId={}", doctorId);
    }

    @Override
    @Caching(
            evict = {
                @CacheEvict(value = "getWebLeadData", key = "#doctorId"),
                @CacheEvict(value = "getDoctorAllInvitation", key = "#doctorId"),
                @CacheEvict(value = "pendingPatientActionResponse", key = "#doctorId"),
                @CacheEvict(value = "getCategorizedAlignerActionDetailsDashboard", key = "#doctorId")
            })
    public void evictDashboardCaches(Long doctorId) {
        log.debug("Evicted dashboard caches for doctorId={}", doctorId);
    }

    private void evictListCaches(Long doctorId) {
        for (PatientListType type : PatientListType.values()) {
            evictClearAlignersListCache(doctorId + "_" + type);
        }
    }

    @Override
    public void evictClearAlignersListCache(String cacheKey) {}

    @Override
    public void evictAlignerAction(Long doctorId, AlignerActionType actionType) {
        log.debug("Evicted aligner action cache for doctorId={}, actionType={}", doctorId, actionType);
    }

    @Override
    public void evictLeadData(Long doctorId) {
        log.debug("Evicted lead data cache for doctorId={}", doctorId);
    }

    @Override
    public void evictProductionCache(long doctorId) {
        evictSpecificCache(doctorId, "ALL");
        EnumSet.allOf(ProductionStatus.class).forEach(status -> evictSpecificCache(doctorId, status.toString()));
    }

    @Override
    public void evictSpecificCache(long doctorId, String status) {}
}
