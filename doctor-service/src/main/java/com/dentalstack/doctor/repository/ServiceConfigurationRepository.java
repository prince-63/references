package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.serviceconfig.ServiceConfiguration;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceConfigurationRepository extends JpaRepository<ServiceConfiguration, Long> {

    @Query("SELECT si.itemName FROM ServiceConfiguration sc " + "JOIN sc.enabledItems si "
            + "WHERE sc.userProfile.id = :profileId "
            + "AND si.itemName IN ('MANUFACTURING', 'PLANNING')")
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
       WHERE sc.userProfile.id = :profileId
       AND si.itemName = 'VSP PLANNING'
       """)
    Boolean isVspPlanningUser(@Param("profileId") Long profileId);
}
