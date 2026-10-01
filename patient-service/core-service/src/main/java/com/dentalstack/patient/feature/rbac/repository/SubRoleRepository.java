package com.dentalstack.patient.feature.rbac.repository;

import com.dentalstack.patient.feature.rbac.entity.Plan;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.enums.PermissionType;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubRoleRepository extends JpaRepository<SubRole, Long> {
    @Query(
            """
        SELECT CASE WHEN COUNT(srsmp) > 0 THEN true ELSE false END
        FROM SubRoleSubModulePermission srsmp
        JOIN srsmp.subModule sm
        JOIN sm.module m
        WHERE srsmp.subRole.id = :subRoleId
        AND m.name = :moduleName
        AND sm.name = :subModuleName
        AND :permissionType MEMBER OF srsmp.permissions
        """)
    boolean hasPermission(
            @Param("subRoleId") Long subRoleId,
            @Param("moduleName") String moduleName,
            @Param("subModuleName") String subModuleName,
            @Param("permissionType") PermissionType permissionType);

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

    boolean existsByNameAndPlan(String name, Plan plan);

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
}
