package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.patient.entity.PatientNotes;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientNotesRepository extends JpaRepository<PatientNotes, Long> {
    @Query("SELECT pn FROM PatientNotes pn " + "LEFT JOIN FETCH pn.patient p "
            + "LEFT JOIN FETCH pn.addedBy up "
            + "LEFT JOIN FETCH up.user u "
            + "WHERE pn.patient.id = :patientId "
            + "ORDER BY pn.id DESC")
    List<PatientNotes> findByPatientIdWithUserProfile(@Param("patientId") Long patientId);

    Optional<PatientNotes> findByIdAndPatientId(Long id, Long patientId);

    void deleteAllByPatientId(Long patientId);

    @Query("SELECT pn FROM PatientNotes pn " + "LEFT JOIN FETCH pn.patient p "
            + "LEFT JOIN FETCH pn.addedBy up "
            + "LEFT JOIN FETCH up.user u "
            + "WHERE pn.addedBy.id = :profileId "
            + "ORDER BY pn.id DESC")
    List<PatientNotes> findByProfileIdWithUserProfile(@Param("profileId") Long profileId);

    @Query("SELECT pn FROM PatientNotes pn " + "LEFT JOIN FETCH pn.patient p "
            + "LEFT JOIN FETCH pn.addedBy up "
            + "LEFT JOIN FETCH up.user u "
            + "WHERE pn.addedBy.id = :profileId "
            + "AND pn.patient.id = :patientId "
            + "ORDER BY pn.id DESC")
    List<PatientNotes> findByProfileIdAndPatientIdWithUserProfile(
            @Param("profileId") Long profileId, @Param("patientId") Long patientId);
}
