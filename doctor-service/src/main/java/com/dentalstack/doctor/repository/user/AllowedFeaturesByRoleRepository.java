package com.dentalstack.doctor.repository.user;

import com.dentalstack.doctor.entity.user.AllowedFeaturesByRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AllowedFeaturesByRoleRepository extends JpaRepository<AllowedFeaturesByRole, Long> {}
