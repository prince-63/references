package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.DoctorBrand;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorBrandRepository extends JpaRepository<DoctorBrand, Long> {

    List<DoctorBrand> findByDoctorId(Long doctorId);

    List<DoctorBrand> findByDoctorIdAndIsSelectedTrue(Long doctorId);
}
