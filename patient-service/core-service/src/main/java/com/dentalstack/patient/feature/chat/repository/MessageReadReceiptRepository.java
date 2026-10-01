package com.dentalstack.patient.feature.chat.repository;

import com.dentalstack.patient.feature.chat.entity.MessageReadReceipt;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageReadReceiptRepository extends JpaRepository<MessageReadReceipt, Long> {

    @Query(
            """
        SELECT mrr.message.id FROM MessageReadReceipt mrr
        WHERE mrr.message.id IN :messageIds
        AND mrr.userProfile.id = :userProfileId
    """)
    Set<Long> findReadMessageIdsByUserProfileId(
            @Param("messageIds") Set<Long> messageIds, @Param("userProfileId") Long userProfileId);

    boolean existsByMessageIdAndUserProfileId(Long messageId, Long userProfileId);
}
