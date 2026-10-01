package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    @Query("SELECT DISTINCT d.id FROM Doctor d")
    List<Long> findAllDoctorIds();
}
