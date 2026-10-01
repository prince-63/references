package com.dentalstack.patient.feature.invitation.repository;

import com.dentalstack.patient.feature.invitation.entity.PatientCustomerInvitation;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientCustomerInvitationRepository extends JpaRepository<PatientCustomerInvitation, Long> {
    void deleteAllByPatientId(Long patientId);

    @Query(
            """
        SELECT pci FROM PatientCustomerInvitation pci
        LEFT JOIN FETCH pci.patient p
        WHERE pci.invitationCode = :invitationCode
        """)
    List<PatientCustomerInvitation> findByInvitationCode(@Param("invitationCode") String invitationCode);
}
