package com.dentalstack.patient.feature.rbac.repository;

import com.dentalstack.patient.feature.rbac.entity.SubModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubModuleRepository extends JpaRepository<SubModule, Long> {}
