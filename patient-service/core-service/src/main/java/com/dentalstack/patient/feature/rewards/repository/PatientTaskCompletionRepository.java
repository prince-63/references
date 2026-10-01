package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.entity.PatientTaskCompletion;
import com.dentalstack.patient.feature.rewards.enums.TaskCategory;
import com.dentalstack.patient.feature.rewards.enums.TaskCompletionStatus;
import feign.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PatientTaskCompletionRepository extends JpaRepository<PatientTaskCompletion, Long> {

    @Query(
            """
    SELECT ptc
    FROM PatientTaskCompletion ptc
    WHERE ptc.patient.id = :patientId
      AND ptc.completionDate = :completionDate
      AND ptc.alignerNo = :alignerNo
""")
    List<PatientTaskCompletion> findByPatientIdAndCompletionDateAndAlignerNo(
            @Param("patientId") Long patientId,
            @Param("completionDate") LocalDate completionDate,
            @Param("alignerNo") Integer alignerNo);

    @Query(
            """
    SELECT CASE WHEN COUNT(ptc) > 0 THEN true ELSE false END
    FROM PatientTaskCompletion ptc
    WHERE ptc.patient.id = :patientId
      AND ptc.rewardTaskConfig.id = :taskId
      AND ptc.completionDate = :today
      AND ptc.alignerNo = :alignerNo
""")
    boolean existsByPatientIdAndRewardTaskConfigIdAndCompletionDateAndAlignerNo(
            @Param("patientId") Long patientId,
            @Param("taskId") Long taskId,
            @Param("today") LocalDate today,
            @Param("alignerNo") Integer alignerNo);

    boolean existsByPatientIdAndCompletionDateAndStatus(
            Long id, LocalDate yesterday, TaskCompletionStatus taskCompletionStatus);

    Page<PatientTaskCompletion> findByPatientIdAndStatus(
            Long patientId, TaskCompletionStatus completionStatus, Pageable pageable);

    Page<PatientTaskCompletion> findByPatientId(Long patientId, Pageable pageable);

    Optional<PatientTaskCompletion> findTopByPatientIdAndRewardTaskConfigIdOrderByCompletedAtDesc(
            Long patientId, Long taskConfigId);

    boolean existsByPatientIdAndRewardTaskConfigIdAndStatus(
            Long patientId, Long taskConfigId, TaskCompletionStatus status);

    @Query("SELECT tc FROM PatientTaskCompletion tc " + "JOIN FETCH tc.rewardTaskConfig rtc "
            + "WHERE tc.patient.id = :patientId "
            + "AND rtc.category = :category "
            + "AND tc.status = :status "
            + "AND tc.completionDate BETWEEN :startDate AND :endDate "
            + "ORDER BY tc.completedAt DESC")
    List<PatientTaskCompletion> findByPatientIdAndCategoryAndDateRange(
            @Param("patientId") Long patientId,
            @Param("category") TaskCategory category,
            @Param("status") TaskCompletionStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT tc FROM PatientTaskCompletion tc " + "JOIN FETCH tc.rewardTaskConfig rtc "
            + "WHERE tc.patient.id = :patientId "
            + "AND rtc.category = :category "
            + "AND tc.status = :status "
            + "ORDER BY tc.completedAt DESC")
    List<PatientTaskCompletion> findByPatientIdAndCategoryAndStatus(
            @Param("patientId") Long patientId,
            @Param("category") TaskCategory category,
            @Param("status") TaskCompletionStatus status);

    @Query(
            """
    SELECT tc FROM PatientTaskCompletion tc
    JOIN FETCH tc.rewardTaskConfig rtc
    WHERE tc.patient.id = :patientId
    AND rtc.category = :category
    AND tc.status = :status
    AND (:alignerNo IS NULL OR tc.alignerNo = :alignerNo)
    ORDER BY tc.completedAt DESC
""")
    List<PatientTaskCompletion> findByPatientIdAndCategoryAndStatusAndAlignerNo(
            @Param("patientId") Long patientId,
            @Param("category") TaskCategory category,
            @Param("status") TaskCompletionStatus status,
            @Param("alignerNo") Integer alignerNo);
}
