package com.dentalstack.patient.feature.rbac.repository;

import com.dentalstack.patient.feature.rbac.entity.SubRoleModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubRoleModulePermissionRepository extends JpaRepository<SubRoleModulePermission, Long> {}
