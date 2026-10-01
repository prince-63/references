package com.dentalstack.patient.feature.caserecord.repository;

import com.dentalstack.patient.feature.caserecord.entity.CaseRecordUserMapping;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseRecordUserMappingRepository extends JpaRepository<CaseRecordUserMapping, Long> {

    @Query(
            value =
                    """
        SELECT EXISTS (
            SELECT 1
            FROM case_record cr
            JOIN case_record_user_mapping crum
                ON crum.case_record_id = cr.id
            JOIN patient_doctor_organization pdo
                ON pdo.patient_id = :patientId
            WHERE cr.id = :caseRecordId
              AND pdo.user_profile_id = crum.user_profile_id
        )
        """,
            nativeQuery = true)
    Boolean isCaseRecordCreatedByCustomer(@Param("caseRecordId") Long caseRecordId, @Param("patientId") Long patientId);

    @Query(
            value =
                    """
        SELECT EXISTS (
            SELECT 1
            FROM case_record cr
            JOIN case_record_user_mapping crum
                ON crum.case_record_id = cr.id
            JOIN user_profile up
                ON up.id = crum.user_profile_id
            JOIN patient_doctor_organization pdo
                ON pdo.patient_id = :patientId
            WHERE cr.id = :caseRecordId
              AND (
                  up.inviter_profile_id = pdo.user_profile_id
                  OR up.id = pdo.added_by_user_profile_id
                  OR up.inviter_profile_id = pdo.added_by_user_profile_id
                  OR up.id = (SELECT inviter_profile_id FROM user_profile WHERE id = pdo.added_by_user_profile_id)
              )
        )
        """,
            nativeQuery = true)
    Boolean isCaseRecordCreatedByAdmin(@Param("caseRecordId") Long caseRecordId, @Param("patientId") Long patientId);

    void deleteByCaseRecordId(Long caseRecordId);

    @Query("SELECT crum FROM CaseRecordUserMapping crum WHERE crum.caseRecord.patient.id = :patientId")
    List<CaseRecordUserMapping> findAllByPatientId(@Param("patientId") Long patientId);
}
