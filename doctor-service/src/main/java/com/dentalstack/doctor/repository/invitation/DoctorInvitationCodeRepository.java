package com.dentalstack.doctor.repository.invitation;

import com.dentalstack.doctor.entity.invitation.DoctorInvitationCode;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorInvitationCodeRepository extends JpaRepository<DoctorInvitationCode, Long> {
    Optional<DoctorInvitationCode> findByCode(String invitationCode);

    @Query(
            """
    SELECT d
    FROM DoctorInvitationCode d
    JOIN FETCH d.doctorInvitation di
    LEFT JOIN FETCH di.inviter inviterDoc
    LEFT JOIN FETCH di.organization o
    LEFT JOIN FETCH di.invitedDoctor id
    LEFT JOIN FETCH di.inviterUserProfile iup
    LEFT JOIN FETCH iup.user iupu
    WHERE LOWER(d.code) = LOWER(:code)
""")
    Optional<DoctorInvitationCode> findByCodeIgnoreCase(@Param("code") String code);
}
