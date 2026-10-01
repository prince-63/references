package com.dentalstack.chat.repository;

import com.dentalstack.chat.entity.Chat;
import com.dentalstack.chat.summary.ChatSummary;
import com.dentalstack.chat.summary.ChatSummaryDetail;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByDoctorIdAndPatientIdAndActiveTrueOrderByIdAsc(Long doctorId, Long patientId);

    List<Chat> findByDoctorIdAndPatientIdAndMessageReadFalseAndRoleName(Long doctorId, Long patientId, String doctor);

    Long countByDoctorIdAndPatientIdAndMessageReadFalseAndRoleName(Long doctorId, Long patientId, String roleName);

    Long countByDoctorIdAndMessageReadFalseAndRoleName(Long doctorId, String roleName);

    @Query(
            "SELECT COUNT(c) FROM Chat c WHERE c.doctorId = :doctorId AND c.messageRead = false AND c.roleName = 'Patient' AND c.patientId IN :patientIds")
    long countByDoctorIdAndMessageReadFalseAndRoleNameAndPatientIds(
            @Param("doctorId") Long doctorId, @Param("patientIds") List<Long> patientIds);

    Chat findTopByDoctorIdAndPatientIdAndActiveTrueOrderByIdDesc(Long doctorId, Long patientId);

    List<Chat> findByPatientIdAndActiveTrue(Long patientId);

    List<Chat> findByPatientId(Long patientId);

    List<Chat> findTopByPatientIdAndMessageReadFalseAndRoleNameAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long patientId, String roleName, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT DISTINCT c.patientId FROM Chat c WHERE c.messageRead = false AND c.roleName = :roleName")
    List<Long> findDistinctPatientIdByMessageReadFalseAndRoleName(@Param("roleName") String roleName);

    void deleteAllByPatientId(Long patientId);

    @Query(value = "SELECT * FROM chat WHERE file_ids IS NOT NULL AND file_ids && ARRAY[:fileIds]", nativeQuery = true)
    List<Chat> findChatsContainingAnyFileId(@Param("fileIds") Long[] fileIds);

    @Query("SELECT c.id as id, " + "c.message as message, "
            + "c.imageName as imageName, "
            + "c.doctorId as doctorId, "
            + "c.patientId as patientId, "
            + "c.createdBy as createdBy, "
            + "c.createdAt as createdAt, "
            + "c.roleName as roleName "
            + "FROM Chat c "
            + "WHERE c.doctorId = :doctorId "
            + "AND c.patientId = :patientId "
            + "AND c.active = true "
            + "ORDER BY c.id DESC "
            + "LIMIT 1")
    Optional<ChatSummary> findChatSummary(@Param("doctorId") Long doctorId, @Param("patientId") Long patientId);

    @Query("SELECT COUNT(c) " + "FROM Chat c "
            + "WHERE c.doctorId = :doctorId "
            + "AND c.patientId = :patientId "
            + "AND c.messageRead = false "
            + "AND c.roleName = :roleName")
    long countUnreadMessages(
            @Param("doctorId") Long doctorId, @Param("patientId") Long patientId, @Param("roleName") String roleName);

    // Query to get the latest unread message id if needed
    @Query("SELECT c.id " + "FROM Chat c "
            + "WHERE c.doctorId = :doctorId "
            + "AND c.patientId = :patientId "
            + "AND c.messageRead = false "
            + "AND c.roleName = :roleName "
            + "ORDER BY c.id DESC "
            + "LIMIT 1")
    Optional<Long> findLatestUnreadMessageId(
            @Param("doctorId") Long doctorId, @Param("patientId") Long patientId, @Param("roleName") String roleName);

    @Query("SELECT c.id as id, " + "c.message as message, "
            + "c.imageName as imageName, "
            + "c.doctorId as doctorId, "
            + "c.patientId as patientId, "
            + "c.createdBy as createdBy, "
            + "c.createdAt as createdAt, "
            + "c.roleName as roleName, "
            + "(SELECT COUNT(u) FROM Chat u WHERE u.doctorId = c.doctorId "
            + "  AND u.patientId = c.patientId "
            + "  AND u.messageRead = false "
            + "  AND u.roleName = 'Patient') as unreadCount, "
            + "(SELECT MAX(u.id) FROM Chat u WHERE u.doctorId = c.doctorId "
            + "  AND u.patientId = c.patientId "
            + "  AND u.messageRead = false "
            + "  AND u.roleName = 'Patient') as lastUnreadId "
            + "FROM Chat c "
            + "WHERE c.doctorId = :doctorId "
            + "AND c.patientId IN :patientIds "
            + "AND c.id IN (SELECT MAX(c2.id) FROM Chat c2 "
            + "            WHERE c2.doctorId = c.doctorId "
            + "            AND c2.patientId = c.patientId "
            + "            GROUP BY c2.patientId)")
    List<ChatSummaryDetail> findAllChatSummariesByDoctorAndPatients(
            @Param("doctorId") Long doctorId, @Param("patientIds") List<Long> patientIds);

    @Query("SELECT c FROM Chat c WHERE c.patientId = :patientId " + "AND c.messageRead = false "
            + "AND c.roleName = :roleName "
            + "AND (c.popupDismissed = false OR c.popupDismissed IS NULL) "
            + "AND c.active = true "
            + "ORDER BY c.createdAt DESC")
    Optional<Chat> findFirstByPatientIdAndMessageReadFalseAndRoleNameAndActiveTrueOrderByCreatedAtDesc(
            @Param("patientId") Long patientId, @Param("roleName") String roleName);
}
