package com.dentalstack.patient.feature.chat.service;

import com.dentalstack.patient.feature.chat.dto.request.*;
import com.dentalstack.patient.feature.chat.dto.response.*;
import com.dentalstack.patient.feature.chat.dto.response.v2.response.ChatListResponseV2;
import jakarta.validation.Valid;

public interface PatientChatService {

    ChatResponse createChat(CreateChatRequest request);

    ChatResponse getChatById(GetChatRequest request);

    ChatResponse getChatByPatientId(Long patientId, Long currentUserProfileId);

    ChatListResponse getMyChats(GetMyChatsRequest request);

    ChatListResponse getUnreadChats(GetMyChatsRequest request);

    ChatResponse addParticipants(AddParticipantsRequest request);

    void removeParticipant(Long chatId, Long userProfileId, Long currentUserProfileId);

    void markAsRead(Long chatId, Long currentUserProfileId);

    void updateTypingStatus(UpdateTypingStatusRequest request, Long currentUserProfileId);

    void updateOnlineStatus(Long userProfileId, Boolean isOnline);

    Long getUnreadCount(Long currentUserProfileId);

    ChatListResponseV2 getMyChatsV2(@Valid GetMyChatsRequest request);
}
