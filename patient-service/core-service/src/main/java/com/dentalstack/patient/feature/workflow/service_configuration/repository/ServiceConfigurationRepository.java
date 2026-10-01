package com.dentalstack.patient.feature.workflow.service_configuration.repository;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.service_configuration.entity.ServiceConfiguration;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceConfigurationRepository extends JpaRepository<ServiceConfiguration, Long> {
    Optional<ServiceConfiguration> findByUserProfile(UserProfile userProfile);

    @Query("SELECT sc FROM ServiceConfiguration sc " + "LEFT JOIN FETCH sc.enabledItems "
            + "WHERE sc.userProfile.id = :profileId")
    ServiceConfiguration findByUserProfileId(@Param("profileId") Long profileId);

    @Query("SELECT si.itemName FROM ServiceConfiguration sc " + "JOIN sc.enabledItems si "
            + "WHERE sc.userProfile.id = :profileId "
            + "AND si.itemName IN ('MANUFACTURING', 'PLANNING', 'VSP PLANNING')")
    List<String> findEnabledItemNames(@Param("profileId") Long profileId);

    @Query(
            """
       SELECT CASE WHEN COUNT(si) > 0 THEN true ELSE false END
       FROM ServiceConfiguration sc
       JOIN sc.enabledItems si
       WHERE sc.userProfile.id = :profileId
       AND si.itemName = 'PLANNING'
       """)
    Boolean isPlanningUser(@Param("profileId") Long profileId);

    @Query(
            """
       SELECT CASE WHEN COUNT(si) > 0 THEN true ELSE false END
       FROM ServiceConfiguration sc
       JOIN sc.enabledItems si
       WHERE sc.userProfile.id = (
           SELECT CASE
               WHEN up.profileType = com.dentalstack.patient.feature.doctor.enums.ProfileType.INVITED
                   THEN up.inviterProfile.id
               ELSE up.id
           END
           FROM UserProfile up
           WHERE up.id = :profileId
       )
       AND si.itemName = 'VSP PLANNING'
       """)
    Boolean isVspPlanningUser(@Param("profileId") Long profileId);
}
