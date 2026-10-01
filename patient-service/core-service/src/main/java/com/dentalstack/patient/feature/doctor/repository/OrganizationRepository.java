package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.doctor.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {}
