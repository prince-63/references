package com.dentalstack.patient.feature.chat.repository;

import com.dentalstack.patient.feature.chat.entity.ChatMessage;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm FROM ChatMessage cm " + "WHERE cm.chat.id = :chatId "
            + "AND cm.createdAt < :beforeTimestamp "
            + "AND cm.isDeleted = false "
            + "ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByChatIdBeforeTimestamp(
            @Param("chatId") Long chatId, @Param("beforeTimestamp") ZonedDateTime beforeTimestamp, Pageable pageable);

    @Query(
            value =
                    """
    SELECT DISTINCT m FROM ChatMessage m
    LEFT JOIN FETCH m.senderProfile sp
    LEFT JOIN FETCH sp.user spu
    LEFT JOIN FETCH sp.doctorBilling spb
    LEFT JOIN FETCH m.replyToMessage rtm
    LEFT JOIN FETCH rtm.senderProfile rtmsp
    LEFT JOIN FETCH rtmsp.user rtmspu
    LEFT JOIN FETCH rtmsp.doctorBilling rtmspb
    LEFT JOIN FETCH m.alignerCheckIn aci
    LEFT JOIN FETCH aci.submittedBy acisb
    LEFT JOIN FETCH acisb.user acisbu
    LEFT JOIN FETCH acisb.doctorBilling acisbb
    LEFT JOIN FETCH m.files
    LEFT JOIN FETCH m.readReceipts rr
    LEFT JOIN FETCH rr.userProfile rrup
    LEFT JOIN FETCH rrup.user rrupu
    WHERE m.chat.id = :chatId
    ORDER BY m.createdAt DESC
    """,
            countQuery = """
SELECT COUNT(DISTINCT m) FROM ChatMessage m
WHERE m.chat.id = :chatId
""")
    Page<ChatMessage> findByChatIdWithAllRelations(@Param("chatId") Long chatId, Pageable pageable);

    @Query(
            """
    SELECT DISTINCT m FROM ChatMessage m
    LEFT JOIN FETCH m.senderProfile sp
    LEFT JOIN FETCH sp.user spu
    LEFT JOIN FETCH sp.doctorBilling spb
    LEFT JOIN FETCH m.replyToMessage rtm
    LEFT JOIN FETCH rtm.senderProfile rtmsp
    LEFT JOIN FETCH rtmsp.user rtmspu
    LEFT JOIN FETCH rtmsp.doctorBilling rtmspb
    LEFT JOIN FETCH m.alignerCheckIn aci
    LEFT JOIN FETCH aci.submittedBy acisb
    LEFT JOIN FETCH acisb.user acisbu
    LEFT JOIN FETCH acisb.doctorBilling acisbb
    LEFT JOIN FETCH m.files
    WHERE m.id = :messageId
""")
    Optional<ChatMessage> findByIdWithAllRelations(@Param("messageId") Long messageId);

    @Query(
            value =
                    """
    SELECT m.id FROM ChatMessage m
    WHERE m.chat.id = :chatId
    ORDER BY m.createdAt DESC
    """,
            countQuery = """
    SELECT COUNT(m) FROM ChatMessage m
    WHERE m.chat.id = :chatId
    """)
    Page<Long> findMessageIdsByChatId(@Param("chatId") Long chatId, Pageable pageable);

    @Query(
            """
    SELECT DISTINCT m FROM ChatMessage m
    LEFT JOIN FETCH m.senderProfile sp
    LEFT JOIN FETCH sp.user spu
    LEFT JOIN FETCH sp.doctorBilling spb
    LEFT JOIN FETCH m.replyToMessage rtm
    LEFT JOIN FETCH rtm.senderProfile rtmsp
    LEFT JOIN FETCH rtmsp.user rtmspu
    LEFT JOIN FETCH rtmsp.doctorBilling rtmspb
    LEFT JOIN FETCH m.alignerCheckIn aci
    LEFT JOIN FETCH aci.submittedBy acisb
    LEFT JOIN FETCH acisb.user acisbu
    LEFT JOIN FETCH acisb.doctorBilling acisbb
    LEFT JOIN FETCH m.files
    LEFT JOIN FETCH m.readReceipts rr
    LEFT JOIN FETCH rr.userProfile rrup
    LEFT JOIN FETCH rrup.user rrupu
    WHERE m.id IN :ids
    ORDER BY m.createdAt DESC
    """)
    List<ChatMessage> findAllByIdsWithRelations(@Param("ids") List<Long> ids);
}
