package com.dentalstack.doctor.repository.user;

import com.dentalstack.doctor.entity.organization.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {}
