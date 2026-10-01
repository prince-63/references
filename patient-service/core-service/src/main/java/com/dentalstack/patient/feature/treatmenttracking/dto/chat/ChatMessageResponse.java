package com.dentalstack.patient.feature.treatmenttracking.dto.chat;

import com.dentalstack.patient.feature.treatmenttracking.enums.ChatEventType;
import com.dentalstack.patient.feature.treatmenttracking.enums.SenderType;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
public class ChatMessageResponse {
    private Long id;
    private SenderType senderType;
    private Long senderId;
    private String senderName;
    private String message;
    private ChatEventType eventType;
    private String eventPayload;
    private List<AttachmentFileResponse> attachments;
    private Boolean isRead;
    private ZonedDateTime createdAt;

    @Data
    @Builder
    public static class AttachmentFileResponse {
        private Long fileId;
        private String fileName;
        private String url;
    }
}
