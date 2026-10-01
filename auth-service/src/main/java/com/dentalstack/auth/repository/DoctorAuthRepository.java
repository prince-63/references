package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.DoctorAuth;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorAuthRepository extends JpaRepository<DoctorAuth, Long> {
    Optional<DoctorAuth> findByEmail(String email);

    Optional<DoctorAuth> findByMobileNo(String mobileNo);

    Optional<DoctorAuth> findByEmailAndMobileNo(String email, String mobileNo);

    Optional<DoctorAuth> findByDoctorId(Long doctorId);
}
