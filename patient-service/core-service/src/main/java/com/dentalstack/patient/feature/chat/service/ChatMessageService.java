package com.dentalstack.patient.feature.chat.service;

import com.dentalstack.patient.feature.chat.dto.request.GetMessagesByChatRequest;
import com.dentalstack.patient.feature.chat.dto.request.SendMessageRequest;
import com.dentalstack.patient.feature.chat.dto.response.MessageListResponse;
import com.dentalstack.patient.feature.chat.dto.response.MessageResponse;
import com.dentalstack.patient.feature.chat.entity.DoctorChat;
import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketMessageEvent;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import jakarta.validation.Valid;
import java.time.ZonedDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ChatMessageService {

    MessageResponse sendMessage(SendMessageRequest request, MultipartFile[] files);

    MessageResponse getMessage(Long messageId, Long currentUserProfileId);

    MessageListResponse getMessagesByChat(GetMessagesByChatRequest request);

    MessageListResponse getMessagesBeforeTimestamp(
            Long chatId, ZonedDateTime beforeTimestamp, Long currentUserProfileId, Pageable pageable);

    void deleteMessage(Long messageId, Long currentUserProfileId);

    MessageResponse editMessage(Long messageId, String newContent, Long currentUserProfileId);

    void broadcastMessageEventToParticipants(DoctorChat chat, WebSocketMessageEvent baseEvent, UserProfile sender);

    MessageListResponse getVspMessagesByChat(@Valid GetMessagesByChatRequest request);
}
