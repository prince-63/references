package com.dentalstack.patient.feature.chat.repository;

import com.dentalstack.patient.feature.chat.dto.response.v2.summery.ChatListSummaryV2;
import com.dentalstack.patient.feature.chat.entity.DoctorChat;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorChatRepository extends JpaRepository<DoctorChat, Long> {

    Optional<DoctorChat> findByPatientId(Long patientId);

    @Query(
            value =
                    """
        SELECT DISTINCT dc FROM DoctorChat dc
        JOIN FETCH dc.patient patient
        LEFT JOIN FETCH patient.doctorOrganization pdo
        LEFT JOIN FETCH pdo.userProfile up
        LEFT JOIN FETCH up.user u
        JOIN dc.participants p
        WHERE p.userProfile.id = :userProfileId
        AND p.isActive = true
        AND dc.isActive = true
        ORDER BY dc.lastMessageAt DESC NULLS LAST
        """,
            countQuery =
                    """
        SELECT COUNT(DISTINCT dc) FROM DoctorChat dc
        JOIN dc.participants p
        WHERE p.userProfile.id = :userProfileId
        AND p.isActive = true
        AND dc.isActive = true
        """)
    Page<DoctorChat> findChatsByUserProfileId(@Param("userProfileId") Long userProfileId, Pageable pageable);

    @Query(
            value =
                    """
        SELECT DISTINCT dc FROM DoctorChat dc
        JOIN FETCH dc.patient patient
        LEFT JOIN FETCH patient.doctorOrganization pdo
        LEFT JOIN FETCH pdo.userProfile up
        LEFT JOIN FETCH up.user u
        JOIN dc.participants p
        WHERE p.userProfile.id = :userProfileId
        AND p.isActive = true
        AND dc.isActive = true
        AND p.unreadCount > 0
        ORDER BY dc.lastMessageAt DESC
        """,
            countQuery =
                    """
        SELECT COUNT(DISTINCT dc) FROM DoctorChat dc
        JOIN dc.participants p
        WHERE p.userProfile.id = :userProfileId
        AND p.isActive = true
        AND dc.isActive = true
        AND p.unreadCount > 0
        """)
    Page<DoctorChat> findUnreadChatsByUserProfileId(@Param("userProfileId") Long userProfileId, Pageable pageable);

    @Query("SELECT COUNT(dc) FROM DoctorChat dc " + "JOIN dc.participants p "
            + "WHERE p.userProfile.id = :userProfileId "
            + "AND p.isActive = true "
            + "AND p.unreadCount > 0")
    Long countUnreadChatsByUserProfileId(@Param("userProfileId") Long userProfileId);

    @Query("SELECT dc FROM DoctorChat dc " + "WHERE dc.patient.id = :patientId " + "AND dc.isActive = true")
    Optional<DoctorChat> findActiveByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT p.id
    FROM DoctorChat dc
    JOIN dc.patient p
    JOIN ChatParticipant cp ON cp.chat = dc AND cp.userProfile.id = :profileId
    LEFT JOIN Order o ON o.patient = p
    LEFT JOIN o.ownerProfile op
    WHERE dc.isActive = true
    AND (
        :search IS NULL OR :search = '' OR (
            LOWER(dc.chatName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%'))
            OR (
                LOWER(p.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%'))
                AND LOWER(p.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
            )
        )
    )
    AND (
        :#{#customerProfileIds == null} = true
        OR op.id IN :customerProfileIds
    )
    GROUP BY p.id, dc.lastMessageAt
    ORDER BY dc.lastMessageAt DESC NULLS LAST
    """)
    List<Long> findPatientIdsByProfileIdAndSearch(
            @Param("profileId") Long profileId,
            @Param("search") String search,
            @Param("customerProfileIds") List<Long> customerProfileIds);

    @Query(
            """
    SELECT DISTINCT dc FROM DoctorChat dc
    JOIN FETCH dc.patient p
    LEFT JOIN FETCH p.doctorOrganization pdo
    LEFT JOIN FETCH pdo.userProfile up
    LEFT JOIN FETCH up.user u
    LEFT JOIN FETCH dc.participants cp
    LEFT JOIN FETCH cp.userProfile participantUp
    WHERE p.id IN :patientIds
    ORDER BY dc.lastMessageAt DESC NULLS LAST
    """)
    List<DoctorChat> findByPatientIdInOrderByLastMessageAtDesc(@Param("patientIds") List<Long> patientIds);

    @Query("SELECT c.id FROM DoctorChat c WHERE c.patient.id = :patientId")
    List<Long> findChatIdsByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT DISTINCT dc FROM DoctorChat dc
    LEFT JOIN FETCH dc.patient p
    LEFT JOIN FETCH p.doctorOrganization pdo
    LEFT JOIN FETCH pdo.userProfile up
    LEFT JOIN FETCH up.user u
    LEFT JOIN FETCH pdo.doctor d
    LEFT JOIN FETCH pdo.organization o
    LEFT JOIN FETCH dc.participants cp
    LEFT JOIN FETCH cp.userProfile participantUp
    LEFT JOIN FETCH participantUp.user participantUser
    WHERE dc.id = :chatId AND dc.isActive = true
    """)
    Optional<DoctorChat> findByIdWithAllRelations(@Param("chatId") Long chatId);

    @Query(
            value =
                    """
        SELECT
            dc.id                                                   AS chatId,
            dc.chat_name                                            AS chatName,
            dc.description                                          AS description,
            dc.is_active                                            AS isActive,
            dc.created_at                                           AS chatCreatedAt,
            dc.last_message_at                                      AS lastMessageAt,

            (
                SELECT COUNT(*)
                FROM chat_message cm
                WHERE cm.chat_id = dc.id
                  AND cm.is_deleted = false
                  AND cm.sender_profile_id != :userProfileId
                  AND cm.id NOT IN (
                      SELECT mrr.message_id
                      FROM message_read_receipt mrr
                      WHERE mrr.user_profile_id = :userProfileId
                  )
            )                                                       AS unreadCount,

            p.id                                                    AS patientId,
            p.first_name                                            AS patientFirstName,
            p.last_name                                             AS patientLastName,
            p.profile_picture_url                                   AS patientProfilePictureUrl,
            p.customer_mapped_id                                    AS customerMappedId,

            TRIM(CONCAT(
                COALESCE(adder_u.salutation, ''), ' ',
                COALESCE(adder_u.first_name, ''), ' ',
                COALESCE(adder_u.last_name,  '')
            ))                                                      AS patientAddedByName,

            lm.id                                                   AS lastMessageId,
            CAST(lm.message_type AS TEXT)                           AS lastMessageType,
            lm.text_content                                         AS lastMessageTextContent,
            lm.is_deleted                                           AS lastMessageIsDeleted,
            lm.created_at                                           AS lastMessageCreatedAt,
            TRIM(CONCAT(
                COALESCE(lm_u.first_name, ''), ' ',
                COALESCE(lm_u.last_name,  '')
            ))                                                      AS lastMessageSenderName,

            aci.id                                                  AS latestCheckInId,
            aci.chat_id                                             AS checkInChatId,
            aci.message_id                                          AS checkInMessageId,
            aci.aligner_number                                      AS alignerNumber,
            aci.start_aligner_number                                AS startAlignerNumber,
            aci.end_aligner_number                                  AS endAlignerNumber,
            aci.notes                                               AS checkInNotes,
            aci.check_in_date                                       AS checkInDate,
            aci.progress_percentage                                 AS progressPercentage,
            aci.total_aligners                                      AS totalAligners,
            aci.submitted_by_profile_id                             AS checkInSubmittedByProfileId,
            aci_sub_up.user_id                                      AS checkInSubmittedByUserId,
            TRIM(CONCAT(
                COALESCE(aci_sub_u.first_name, ''), ' ',
                COALESCE(aci_sub_u.last_name,  '')
            ))                                                      AS checkInSubmittedByName,
            aci_sub_u.email                                         AS checkInSubmittedByEmail,
            aci_sub_up.organization_brand_name                      AS checkInSubmittedByOrgName,
            aci_sub_u.profile_url                                   AS checkInSubmittedByProfileUrl

        FROM doctor_chat dc

        JOIN chat_participant cp_me
            ON cp_me.chat_id = dc.id
            AND cp_me.user_profile_id = :userProfileId
            AND cp_me.is_active = true

        JOIN patient p ON p.id = dc.patient_id

        LEFT JOIN patient_doctor_organization pdo
            ON pdo.patient_id = p.id
        LEFT JOIN user_profile adder_up
            ON adder_up.id = pdo.user_profile_id
        LEFT JOIN users adder_u
            ON adder_u.id = adder_up.user_id

        LEFT JOIN orders o
            ON o.patient_id = p.id

        LEFT JOIN LATERAL (
            SELECT id, message_type, text_content, is_deleted, created_at, sender_profile_id
            FROM chat_message
            WHERE chat_id = dc.id
              AND is_deleted = false
            ORDER BY created_at DESC
            LIMIT 1
        ) lm ON true
        LEFT JOIN user_profile lm_up ON lm_up.id = lm.sender_profile_id
        LEFT JOIN users lm_u ON lm_u.id = lm_up.user_id

        LEFT JOIN LATERAL (
            SELECT id, chat_id, message_id, aligner_number, start_aligner_number,
                   end_aligner_number, notes, check_in_date, progress_percentage,
                   total_aligners, submitted_by_profile_id
            FROM aligner_check_in
            WHERE patient_id = p.id
            ORDER BY created_at DESC
            LIMIT 1
        ) aci ON true
        LEFT JOIN user_profile aci_sub_up ON aci_sub_up.id = aci.submitted_by_profile_id
        LEFT JOIN users aci_sub_u ON aci_sub_u.id = aci_sub_up.user_id

        WHERE dc.is_active = true
        AND (
            :search IS NULL OR :search = '' OR
            LOWER(p.first_name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.last_name)          LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.email)              LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(dc.chat_name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
            (
                SPLIT_PART(:search, ' ', 2) != '' AND
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                LOWER(p.last_name)  LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
            )
        )
        AND (
            :customerProfileIdsEmpty = true
            OR o.owner_profile_id IN (:customerProfileIds)
        )

        GROUP BY
            dc.id, dc.chat_name, dc.description, dc.is_active,
            dc.created_at, dc.last_message_at,
            p.id, p.first_name, p.last_name, p.profile_picture_url, p.customer_mapped_id,
            adder_u.salutation, adder_u.first_name, adder_u.last_name,
            lm.id, lm.message_type, lm.text_content, lm.is_deleted,
            lm.created_at, lm.sender_profile_id,
            lm_u.first_name, lm_u.last_name,
            aci.id, aci.chat_id, aci.message_id, aci.aligner_number,
            aci.start_aligner_number, aci.end_aligner_number, aci.notes,
            aci.check_in_date, aci.progress_percentage, aci.total_aligners,
            aci.submitted_by_profile_id,
            aci_sub_up.user_id, aci_sub_up.organization_brand_name,
            aci_sub_u.first_name, aci_sub_u.last_name,
            aci_sub_u.email, aci_sub_u.profile_url

        ORDER BY dc.last_message_at DESC NULLS LAST
        LIMIT :limit OFFSET :offset
    """,
            nativeQuery = true)
    List<ChatListSummaryV2> findChatSummariesV2(
            @Param("userProfileId") Long userProfileId,
            @Param("search") String search,
            @Param("customerProfileIds") List<Long> customerProfileIds,
            @Param("customerProfileIdsEmpty") boolean customerProfileIdsEmpty,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query(
            value =
                    """
        SELECT COUNT(DISTINCT dc.id)
        FROM doctor_chat dc
        JOIN chat_participant cp_me
            ON cp_me.chat_id = dc.id
            AND cp_me.user_profile_id = :userProfileId
            AND cp_me.is_active = true
        JOIN patient p ON p.id = dc.patient_id
        LEFT JOIN orders o ON o.patient_id = p.id
        WHERE dc.is_active = true
        AND (
            :search IS NULL OR :search = '' OR
            LOWER(p.first_name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.last_name)          LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.email)              LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(dc.chat_name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
            (
                SPLIT_PART(:search, ' ', 2) != '' AND
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                LOWER(p.last_name)  LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
            )
        )
        AND (
            :customerProfileIdsEmpty = true
            OR o.owner_profile_id IN (:customerProfileIds)
        )
    """,
            nativeQuery = true)
    long countChatSummariesV2(
            @Param("userProfileId") Long userProfileId,
            @Param("search") String search,
            @Param("customerProfileIds") List<Long> customerProfileIds,
            @Param("customerProfileIdsEmpty") boolean customerProfileIdsEmpty);
}
