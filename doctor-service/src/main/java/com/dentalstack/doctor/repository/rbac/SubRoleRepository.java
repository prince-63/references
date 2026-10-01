package com.dentalstack.doctor.repository.rbac;

import com.dentalstack.doctor.entity.rbac.SubRole;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubRoleRepository extends JpaRepository<SubRole, Long> {
    @Query("SELECT DISTINCT sr FROM SubRole sr "
            + "LEFT JOIN FETCH sr.clonedFrom "
            + "LEFT JOIN FETCH sr.createdBy "
            + "LEFT JOIN FETCH sr.modulePermissions mp "
            + "LEFT JOIN FETCH mp.module m "
            + "LEFT JOIN FETCH m.subModules "
            + "LEFT JOIN FETCH sr.subModulePermissions smp "
            + "LEFT JOIN FETCH smp.subModule sm "
            + "LEFT JOIN FETCH sm.module "
            + "LEFT JOIN FETCH smp.permissions "
            + "WHERE sr.id = :subRoleId")
    Optional<SubRole> findByIdWithPermissions(@Param("subRoleId") Long subRoleId);

    @Query("SELECT DISTINCT sr FROM SubRole sr " + "JOIN FETCH sr.plan p "
            + "LEFT JOIN FETCH sr.clonedFrom "
            + "LEFT JOIN FETCH sr.createdBy "
            + "LEFT JOIN FETCH sr.modulePermissions mp "
            + "LEFT JOIN FETCH mp.module m "
            + "LEFT JOIN FETCH m.subModules "
            + "LEFT JOIN FETCH sr.subModulePermissions smp "
            + "LEFT JOIN FETCH smp.subModule sm "
            + "LEFT JOIN FETCH sm.module "
            + "LEFT JOIN FETCH smp.permissions "
            + "WHERE sr.name = :subRoleName AND p.id = :planId")
    Optional<SubRole> findSubRoleByNameAndPlanIdWithPlan(
            @Param("subRoleName") String subRoleName, @Param("planId") Long planId);

    @Query("SELECT DISTINCT sr FROM SubRole sr " + "JOIN FETCH sr.plan p "
            + "LEFT JOIN FETCH sr.clonedFrom "
            + "LEFT JOIN FETCH sr.createdBy "
            + "LEFT JOIN FETCH sr.modulePermissions mp "
            + "LEFT JOIN FETCH mp.module m "
            + "LEFT JOIN FETCH m.subModules "
            + "LEFT JOIN FETCH sr.subModulePermissions smp "
            + "LEFT JOIN FETCH smp.subModule sm "
            + "LEFT JOIN FETCH sm.module "
            + "LEFT JOIN FETCH smp.permissions "
            + "WHERE sr.name = :subRoleName AND p.name = :planName")
    Optional<SubRole> findSubRoleByNameAndPlanNameWithPlan(
            @Param("subRoleName") String subRoleName, @Param("planName") String planName);

    @Query("SELECT sr FROM SubRole sr JOIN sr.plan p WHERE sr.name = :subRoleName AND p.name = :planName")
    Optional<SubRole> findSubRoleByNameAndPlanName(
            @Param("subRoleName") String subRoleName, @Param("planName") String planName);
}
