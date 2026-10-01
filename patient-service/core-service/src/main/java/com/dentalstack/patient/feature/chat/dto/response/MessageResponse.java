package com.dentalstack.patient.feature.chat.dto.response;

import com.dentalstack.patient.feature.chat.enums.MessageType;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {

    private Long id;
    private Long chatId;
    private MessageType messageType;
    private String textContent;
    private Boolean isDeleted;
    private ZonedDateTime createdAt;
    private ZonedDateTime editedAt;
    private Boolean isEdited;

    private UserProfileInfoResponse sender;
    private MessageResponse replyToMessage;

    private List<FileDetails> attachments;
    private List<MessageReadReceiptResponse> readReceipts;

    private AlignerCheckInResponse alignerCheckIn;
}
