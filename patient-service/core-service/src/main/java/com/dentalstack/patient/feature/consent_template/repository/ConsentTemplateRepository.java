package com.dentalstack.patient.feature.consent_template.repository;

import com.dentalstack.patient.feature.consent_template.entity.ConsentTemplate;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateLocation;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ConsentTemplateRepository extends JpaRepository<ConsentTemplate, Long> {

    @Modifying
    @Transactional
    @Query(
            """
        UPDATE ConsentTemplate ct
        SET ct.isDefault = false
        WHERE ct.userProfile.id = :profileId
          AND ct.type = :type
          AND ct.location = :location
          AND ct.isActive = true
    """)
    void updateExistingTemplateDefaultStatus(
            @Param("profileId") Long profileId,
            @Param("type") ConsentTemplateType type,
            @Param("location") ConsentTemplateLocation location);

    @Query(
            """
        SELECT ct FROM ConsentTemplate ct
        WHERE ct.userProfile.id = :profileId
          AND ct.type = :consentTemplateType
          AND ct.isActive = true
        """)
    List<ConsentTemplate> findByUserProfileAndType(
            @Param("profileId") Long profileId, @Param("consentTemplateType") ConsentTemplateType consentTemplateType);

    @Query(
            """
       SELECT ct FROM ConsentTemplate ct
       WHERE ct.userProfile.id = :profileId
         AND ct.type = :type
         AND ct.location = :location
         AND ct.isDefault = true
         AND ct.isActive = true
    """)
    Optional<ConsentTemplate> findDefaultByProfileTypeAndLocation(
            @Param("profileId") Long profileId,
            @Param("type") ConsentTemplateType type,
            @Param("location") ConsentTemplateLocation location);

    Optional<ConsentTemplate> findFirstByUserProfileIdAndTypeAndLocationAndIsActiveTrueOrderByIdAsc(
            Long profileId, ConsentTemplateType type, ConsentTemplateLocation location);
}
