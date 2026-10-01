package com.dentalstack.patient.feature.chat.repository;

import com.dentalstack.patient.feature.chat.entity.AlignerCheckIn;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerCheckInRepository extends JpaRepository<AlignerCheckIn, Long> {

    @Query("SELECT aci FROM AlignerCheckIn aci " + "WHERE aci.patient.id = :patientId "
            + "ORDER BY aci.alignerNumber DESC, aci.checkInDate DESC")
    Page<AlignerCheckIn> findByPatientIdOrderByAlignerNumberDesc(@Param("patientId") Long patientId, Pageable pageable);

    @Query("SELECT aci FROM AlignerCheckIn aci " + "WHERE aci.patient.id = :patientId "
            + "ORDER BY aci.id DESC "
            + "LIMIT 1")
    Optional<AlignerCheckIn> findLatestByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT aci FROM AlignerCheckIn aci " + "WHERE aci.chat.id = :chatId " + "ORDER BY aci.checkInDate DESC")
    Page<AlignerCheckIn> findByChatIdOrderByCheckInDateDesc(@Param("chatId") Long chatId, Pageable pageable);

    @Query("SELECT MAX(aci.alignerNumber) FROM AlignerCheckIn aci " + "WHERE aci.patient.id = :patientId")
    Optional<Integer> findMaxAlignerNumberByPatientId(@Param("patientId") Long patientId);

    List<AlignerCheckIn> findByPatientIdOrderByCheckInDateDesc(Long patientId);

    Optional<AlignerCheckIn> findByMessageId(Long messageId);
}
