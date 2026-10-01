package com.dentalstack.patient.feature.chat.repository;

import com.dentalstack.patient.feature.chat.entity.ChatParticipant;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    Optional<ChatParticipant> findByChatIdAndUserProfileId(Long chatId, Long userProfileId);

    @Query("SELECT cp FROM ChatParticipant cp " + "JOIN FETCH cp.userProfile up "
            + "JOIN FETCH up.user "
            + "WHERE cp.chat.id = :chatId AND cp.isActive = true")
    List<ChatParticipant> findByChatIdAndIsActiveTrue(@Param("chatId") Long chatId);

    List<ChatParticipant> findByUserProfileIdAndIsActiveTrue(Long userProfileId);

    @Query("SELECT cp FROM ChatParticipant cp " + "WHERE cp.chat.id = :chatId "
            + "AND cp.isActive = true "
            + "AND cp.isOnline = true")
    List<ChatParticipant> findOnlineParticipantsByChatId(@Param("chatId") Long chatId);

    @Modifying
    @Query("UPDATE ChatParticipant cp " + "SET cp.isTyping = :isTyping, cp.typingUpdatedAt = :timestamp "
            + "WHERE cp.chat.id = :chatId "
            + "AND cp.userProfile.id = :userProfileId")
    int updateTypingStatus(
            @Param("chatId") Long chatId,
            @Param("userProfileId") Long userProfileId,
            @Param("isTyping") Boolean isTyping,
            @Param("timestamp") ZonedDateTime timestamp);

    @Modifying
    @Query("UPDATE ChatParticipant cp " + "SET cp.isOnline = :isOnline, cp.lastSeenAt = :timestamp "
            + "WHERE cp.userProfile.id = :userProfileId")
    int updateOnlineStatus(
            @Param("userProfileId") Long userProfileId,
            @Param("isOnline") Boolean isOnline,
            @Param("timestamp") ZonedDateTime timestamp);

    @Modifying
    @Query("UPDATE ChatParticipant cp " + "SET cp.lastReadAt = :timestamp, cp.unreadCount = 0 "
            + "WHERE cp.chat.id = :chatId "
            + "AND cp.userProfile.id = :userProfileId")
    int markAsRead(
            @Param("chatId") Long chatId,
            @Param("userProfileId") Long userProfileId,
            @Param("timestamp") ZonedDateTime timestamp);

    @Query("SELECT COUNT(cp) FROM ChatParticipant cp " + "WHERE cp.chat.id = :chatId " + "AND cp.isActive = true")
    Long countActiveByChatId(@Param("chatId") Long chatId);

    boolean existsByChatIdAndUserProfileIdAndIsActiveTrue(Long chatId, Long userProfileId);

    boolean existsByChatIdAndUserProfileUserEmailAndIsActiveTrue(Long chatId, String email);

    @Query("SELECT CASE WHEN COUNT(cp) > 0 THEN true ELSE false END FROM ChatParticipant cp "
            + "WHERE cp.chat.id = :chatId "
            + "AND cp.isActive = true "
            + "AND cp.userProfile.inviterProfile.id = :ownerProfileId")
    boolean existsParticipantWithInviterProfileId(
            @Param("chatId") Long chatId, @Param("ownerProfileId") Long ownerProfileId);

    @Query("SELECT CASE WHEN COUNT(cp) > 0 THEN true ELSE false END FROM ChatParticipant cp "
            + "JOIN cp.userProfile.inviterProfile ip "
            + "JOIN ip.user iu "
            + "WHERE cp.chat.id = :chatId "
            + "AND cp.isActive = true "
            + "AND iu.email = :ownerEmail")
    boolean existsParticipantWithInviterEmail(@Param("chatId") Long chatId, @Param("ownerEmail") String ownerEmail);

    @Query(
            """
    SELECT COALESCE(SUM(cp.unreadCount), 0) FROM ChatParticipant cp
    WHERE cp.userProfile.id = :userProfileId
    AND cp.isActive = true
""")
    Long sumTotalUnreadCountByUserProfileId(@Param("userProfileId") Long userProfileId);

    @Query(
            value =
                    """
        SELECT COUNT(*) AS unreadCount
        FROM chat_message cm
        JOIN doctor_chat dc ON dc.id = cm.chat_id
        JOIN chat_participant cp ON cp.chat_id = dc.id
            AND cp.user_profile_id = :userProfileId
            AND cp.is_active = true
        WHERE dc.is_active = true
          AND cm.is_deleted = false
          AND cm.sender_profile_id != :userProfileId
          AND cm.id NOT IN (
              SELECT mrr.message_id
              FROM message_read_receipt mrr
              WHERE mrr.user_profile_id = :userProfileId
          )
    """,
            nativeQuery = true)
    Long countTotalUnreadMessages(@Param("userProfileId") Long userProfileId);
}
