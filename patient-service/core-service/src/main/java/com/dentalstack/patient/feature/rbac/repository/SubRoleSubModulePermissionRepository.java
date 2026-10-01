package com.dentalstack.patient.feature.rbac.repository;

import com.dentalstack.patient.feature.rbac.entity.SubModule;
import com.dentalstack.patient.feature.rbac.entity.SubRole;
import com.dentalstack.patient.feature.rbac.entity.SubRoleSubModulePermission;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubRoleSubModulePermissionRepository extends JpaRepository<SubRoleSubModulePermission, Long> {
    Optional<SubRoleSubModulePermission> findBySubRoleAndSubModule(SubRole subRole, SubModule subModule);
}
