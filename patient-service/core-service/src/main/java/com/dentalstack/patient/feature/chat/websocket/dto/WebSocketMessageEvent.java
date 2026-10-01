package com.dentalstack.patient.feature.chat.websocket.dto;

import com.dentalstack.patient.feature.chat.dto.response.AlignerCheckInResponse;
import com.dentalstack.patient.feature.chat.enums.MessageType;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketMessageEvent {

    private String eventType;

    private Long chatId;
    private Long messageId;

    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderOrganization;

    private MessageType messageType;
    private String textContent;

    private String editedContent;

    private Boolean isDeleted;

    private Boolean hasReply;
    private Long replyToMessageId;

    private Integer attachmentCount;
    private List<FileDetails> attachments;

    private AlignerCheckInResponse alignerCheckIn;
    private List<Long> readMessageIds;

    private ZonedDateTime timestamp;
    private ZonedDateTime editedAt;
}
