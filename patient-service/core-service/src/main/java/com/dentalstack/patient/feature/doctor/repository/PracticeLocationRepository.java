package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeLocationRepository extends JpaRepository<PracticeLocation, Long> {

    List<PracticeLocation> findByDoctorIdAndActiveTrue(Long doctorId);

    Long countByDoctorId(Long doctorId);
}
