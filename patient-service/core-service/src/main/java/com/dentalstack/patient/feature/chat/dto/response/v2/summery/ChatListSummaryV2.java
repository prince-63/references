package com.dentalstack.patient.feature.chat.dto.response.v2.summery;

import java.time.LocalDateTime;

public interface ChatListSummaryV2 {

    Long getChatId();

    String getChatName();

    String getDescription();

    Boolean getIsActive();

    LocalDateTime getChatCreatedAt();

    LocalDateTime getLastMessageAt();

    Integer getUnreadCount();

    Long getPatientId();

    String getPatientFirstName();

    String getPatientLastName();

    String getPatientProfilePictureUrl();

    String getCustomerMappedId();

    String getPatientAddedByName();

    Long getLastMessageId();

    String getLastMessageType();

    String getLastMessageTextContent();

    Boolean getLastMessageIsDeleted();

    LocalDateTime getLastMessageCreatedAt();

    String getLastMessageSenderName();

    Long getLatestCheckInId();

    Long getCheckInChatId();

    Long getCheckInMessageId();

    Integer getAlignerNumber();

    Integer getStartAlignerNumber();

    Integer getEndAlignerNumber();

    String getCheckInNotes();

    LocalDateTime getCheckInDate();

    Integer getProgressPercentage();

    Integer getTotalAligners();

    Long getCheckInSubmittedByProfileId();

    Long getCheckInSubmittedByUserId();

    String getCheckInSubmittedByName();

    String getCheckInSubmittedByEmail();

    String getCheckInSubmittedByOrgName();

    String getCheckInSubmittedByProfileUrl();
}
