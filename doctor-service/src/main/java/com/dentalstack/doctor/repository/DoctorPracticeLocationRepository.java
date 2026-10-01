package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.DoctorPracticeLocation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorPracticeLocationRepository extends JpaRepository<DoctorPracticeLocation, Long> {
    List<DoctorPracticeLocation> findByDoctorId(Long doctorId);
}
