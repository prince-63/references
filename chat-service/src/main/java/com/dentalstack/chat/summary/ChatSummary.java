package com.dentalstack.chat.summary;

import java.time.LocalDateTime;

public interface ChatSummary {
    Long getId();

    String getMessage();

    String getImageName();

    Long getDoctorId();

    Long getPatientId();

    String getCreatedBy();

    LocalDateTime getCreatedAt();

    String getRoleName();
}
