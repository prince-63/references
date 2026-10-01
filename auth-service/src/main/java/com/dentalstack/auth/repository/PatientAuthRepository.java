package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.PatientAuth;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientAuthRepository extends JpaRepository<PatientAuth, Long> {
    Optional<PatientAuth> findByMobileNo(String mobileNo);

    Optional<PatientAuth> findByPatientId(Long patientId);
}
