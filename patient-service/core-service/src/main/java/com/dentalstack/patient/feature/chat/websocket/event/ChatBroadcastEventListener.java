package com.dentalstack.patient.feature.chat.websocket.event;

import com.dentalstack.patient.feature.chat.entity.ChatParticipant;
import com.dentalstack.patient.feature.chat.repository.ChatParticipantRepository;
import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketMessageEvent;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatBroadcastEventListener {

    private final ChatParticipantRepository participantRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleChatBroadcast(ChatBroadcastEvent event) {
        Long chatId = event.getChatId();
        Long senderId = event.getSenderId();
        Long patientId = event.getPatientId();
        WebSocketMessageEvent baseEvent = event.getMessageEvent();

        log.info(
                "[CHAT-BROADCAST] >>> handleChatBroadcast ENTERED for chatId={}, senderId={}, patientId={}, eventType={}",
                chatId,
                senderId,
                patientId,
                baseEvent.getEventType());

        List<ChatParticipant> participants;
        try {
            participants = participantRepository.findByChatIdAndIsActiveTrue(chatId);
            log.info("[CHAT-BROADCAST] Found {} active participants for chatId={}", participants.size(), chatId);
        } catch (Exception e) {
            log.error("[CHAT-BROADCAST] FAILED to fetch participants for chatId={}: {}", chatId, e.getMessage(), e);
            return;
        }

        for (ChatParticipant participant : participants) {
            UserProfile participantProfile = participant.getUserProfile();
            if (participantProfile == null || participantProfile.getUser() == null) {
                log.warn("[CHAT-BROADCAST] Skipping participant with null profile/user for chatId={}", chatId);
                continue;
            }

            String email = participantProfile.getUser().getEmail();
            if (email == null) {
                log.warn(
                        "[CHAT-BROADCAST] Skipping participant profileId={} with null email for chatId={}",
                        participantProfile.getId(),
                        chatId);
                continue;
            }

            log.info(
                    "[CHAT-BROADCAST] Processing participant profileId={}, email={}, isPractice={}, chatId={}",
                    participantProfile.getId(),
                    email,
                    participantProfile.isPractice(),
                    chatId);

            WebSocketMessageEvent eventToSend = baseEvent;

            boolean isReceivedByPractice = participantProfile.isPractice()
                    && !participantProfile.getId().equals(senderId);

            if (isReceivedByPractice && patientId != null) {
                try {
                    UserProfile ownerProfile = orderRepository
                            .findLatestTargetProfileByPatientIdAndOwnerProfileId(patientId, participantProfile.getId())
                            .orElse(null);

                    if (ownerProfile != null && ownerProfile.getUser() != null) {
                        User ownerUser = ownerProfile.getUser();
                        eventToSend = baseEvent.toBuilder()
                                .senderName(ownerUser.getFirstName() + " " + ownerUser.getLastName())
                                .senderEmail(ownerUser.getEmail())
                                .senderOrganization(ownerProfile.getOrganizationBrandName())
                                .build();
                    }
                } catch (Exception e) {
                    log.warn(
                            "Could not resolve owner profile for practice participant {}: {}",
                            participantProfile.getId(),
                            e.getMessage());
                }
            }

            try {
                log.info(
                        "[CHAT-BROADCAST] Sending to /user/{}/queue/messages for chatId={}, messageId={}",
                        email,
                        chatId,
                        baseEvent.getMessageId());
                messagingTemplate.convertAndSendToUser(email, "/queue/messages", eventToSend);
                messagingTemplate.convertAndSendToUser(email, "/messages", eventToSend);
                log.info("[CHAT-BROADCAST] SUCCESS sent to user {} for chatId={}", email, chatId);
            } catch (Exception e) {
                log.error(
                        "[CHAT-BROADCAST] FAILED to send WebSocket to user {} for chatId={}: {}",
                        email,
                        chatId,
                        e.getMessage(),
                        e);
            }
        }

        try {
            log.info("[CHAT-BROADCAST] Sending to /topic/chat/{} for messageId={}", chatId, baseEvent.getMessageId());
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, baseEvent);
            log.info("[CHAT-BROADCAST] SUCCESS sent to /topic/chat/{}", chatId);
        } catch (Exception e) {
            log.error("[CHAT-BROADCAST] FAILED to broadcast to /topic/chat/{}: {}", chatId, e.getMessage(), e);
        }

        log.info(
                "[CHAT-BROADCAST] <<< handleChatBroadcast COMPLETE for chatId={}, eventType={}",
                chatId,
                baseEvent.getEventType());
    }
}
