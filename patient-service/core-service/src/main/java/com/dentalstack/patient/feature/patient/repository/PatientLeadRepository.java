package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.patient.entity.PatientLead;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientLeadRepository extends JpaRepository<PatientLead, Long> {
    Optional<PatientLead> findByMobileNo(String mobile);

    Optional<PatientLead> findByUUID(String uuid);

    @Query("SELECT pl FROM PatientLead pl WHERE pl.email = :email ORDER BY pl.createdAt DESC LIMIT 1")
    Optional<PatientLead> findByEmail(@Param("email") String email);
}
