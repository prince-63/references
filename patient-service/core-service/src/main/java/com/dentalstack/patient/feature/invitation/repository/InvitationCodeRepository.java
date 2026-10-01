package com.dentalstack.patient.feature.invitation.repository;

import com.dentalstack.patient.feature.invitation.entity.InvitationCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvitationCodeRepository extends JpaRepository<InvitationCode, Long> {
    Optional<InvitationCode> findByCode(String code);
}
