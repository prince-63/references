package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.doctor.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctor.projection.InvitationSummary;
import com.dentalstack.patient.feature.patient.entity.Invitation;
import com.dentalstack.patient.global.enums.UserType;
import feign.Param;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
            long inviterId, UserType inviterUserType, UserType invitedUserType, List<InvitationStatus> status);

    @Query("SELECT pid.patient.id " + "FROM Invitation i "
            + "JOIN i.patientInvitation pid "
            + "WHERE pid.patient.id IN :patientIds "
            + "AND i.inviterUserType = :inviterUserType "
            + "AND i.invitedUserType = :invitedUserType "
            + "AND i.status IN :statusList")
    Set<Long> findPatientIdsByPatientIdsAndStatus(
            @Param("patientIds") List<Long> patientIds,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("statusList") List<InvitationStatus> statusList);

    @Query("SELECT i.patientInvitation.patient.id AS patientId, i.status AS status "
            + "FROM Invitation i WHERE i.inviterId = :inviterId AND i.inviterUserType = :inviterUserType "
            + "AND i.invitedUserType = :invitedUserType AND i.status IN :statusList")
    List<InvitationSummary> findInvitationSummariesByCriteria(
            @Param("inviterId") long inviterId,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("statusList") List<InvitationStatus> statusList);
}
