package com.dentalstack.patient.feature.workflow.card_display.repository;

import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CardDisplayConfigRepository extends JpaRepository<CardDisplayConfig, Long> {

    @Query(
            """
    SELECT cdc FROM CardDisplayConfig cdc
    WHERE (:profileId IS NULL OR cdc.userProfile.id = :profileId)
      AND (:orgId IS NULL OR cdc.orgId = :orgId)
      AND (:active IS NULL OR cdc.active = :active)
    """)
    Page<CardDisplayConfig> findByFilters(
            @Param("profileId") Long profileId,
            @Param("orgId") Long orgId,
            @Param("active") Boolean active,
            Pageable pageable);

    @Query(
            """
    SELECT DISTINCT up FROM CardDisplayConfig up
    LEFT JOIN FETCH up.cardDisplayFields f
    WHERE up.userProfile.id = :profileId
    """)
    CardDisplayConfig findByUserProfileId(Long profileId);
}
