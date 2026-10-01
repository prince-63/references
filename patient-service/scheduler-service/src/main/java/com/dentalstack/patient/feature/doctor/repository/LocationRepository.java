package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.user.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {}
