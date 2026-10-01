package com.dentalstack.patient.feature.rbac.repository;

import com.dentalstack.patient.feature.rbac.entity.Plan;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {

    @Query("SELECT DISTINCT p FROM Plan p " + "LEFT JOIN FETCH p.subRoles sr "
            + "LEFT JOIN FETCH sr.clonedFrom "
            + "LEFT JOIN FETCH sr.createdBy "
            + "LEFT JOIN FETCH sr.modulePermissions mp "
            + "LEFT JOIN FETCH mp.module m "
            + "LEFT JOIN FETCH m.subModules " + "LEFT JOIN FETCH sr.subModulePermissions smp "
            + "LEFT JOIN FETCH smp.subModule sm "
            + "LEFT JOIN FETCH sm.module " + "LEFT JOIN FETCH smp.permissions "
            + "WHERE p.id = :planId "
            + "AND (sr.subRoleTag = 'DEFAULT' "
            + "OR (sr.subRoleTag = 'CUSTOM' "
            + "AND sr.createdBy.id = :profileId))")
    Optional<Plan> findPlanWithDefaultAndUserCustomRoles(
            @Param("planId") Long planId, @Param("profileId") Long profileId);

    @Query("SELECT DISTINCT p FROM Plan p " + "LEFT JOIN FETCH p.subRoles sr "
            + "WHERE p.id = :planId "
            + "AND (sr.subRoleTag = 'DEFAULT' "
            + "OR (sr.subRoleTag = 'CUSTOM' "
            + "AND sr.createdBy.id = :profileId))")
    Optional<Plan> findPlanWithDefaultAndUserCustomRolesWithMinimal(
            @Param("planId") Long planId, @Param("profileId") Long profileId);
}
