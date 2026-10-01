package com.dentalstack.patient.feature.treatmenttracking.service;

import com.dentalstack.patient.feature.treatmenttracking.dto.chat.AlignerReviewRequest;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.ChatHistoryResponse;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.SendMessageRequest;
import com.dentalstack.patient.feature.treatmenttracking.enums.ChatEventType;
import com.dentalstack.patient.feature.treatmenttracking.enums.SenderType;

public interface TrackingChatService {

    void sendMessage(SendMessageRequest request, Long senderUserId, SenderType senderType);

    void postActivity(Long patientId, SenderType senderType, Long senderId, ChatEventType eventType);

    ChatHistoryResponse getChatHistory(Long patientId, int page, int size);

    void markAsRead(Long patientId, Long readerUserId);

    void submitAlignerReview(AlignerReviewRequest request, Long patientUserId);
}
