package com.dentalstack.chat.repository;

import com.dentalstack.chat.entity.DoctorPatientChat;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorPatientChatRepository extends JpaRepository<DoctorPatientChat, Long> {
    DoctorPatientChat findByDoctorIdAndPatientIdAndIsAddedTrue(Long doctorId, Long patientId);

    Optional<DoctorPatientChat> findByPatientIdAndDoctorId(Long patientId, Long doctorId);

    @Query(
            "SELECT DISTINCT dpc.patientId FROM DoctorPatientChat dpc WHERE dpc.doctorId = :doctorId AND dpc.isAdded = true")
    List<Long> findDistinctPatientIdsByDoctorIdAndIsAddedTrue(Long doctorId);

    DoctorPatientChat findTopByPatientIdAndDoctorIdOrderByCreatedAtDesc(Long patientId, Long doctorId);

    @Query("SELECT dpc FROM DoctorPatientChat dpc " + "WHERE dpc.doctorId = :doctorId "
            + "AND dpc.patientId IN :patientIds "
            + "AND dpc.isAdded = true")
    List<DoctorPatientChat> findAllByDoctorIdAndPatientIdsAndIsAddedTrue(
            @Param("doctorId") Long doctorId, @Param("patientIds") List<Long> patientIds);
}
