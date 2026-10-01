package com.dentalstack.chat.summary;

import java.time.LocalDateTime;

public interface ChatSummaryDetail {
    Long getId();

    String getMessage();

    String getImageName();

    Long getDoctorId();

    Long getPatientId();

    String getCreatedBy();

    LocalDateTime getCreatedAt();

    String getRoleName();

    Long getUnreadCount();

    Long getLastUnreadId();
}
