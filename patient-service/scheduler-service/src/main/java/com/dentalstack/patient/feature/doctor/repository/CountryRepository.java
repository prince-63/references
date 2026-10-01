package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.user.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {}
