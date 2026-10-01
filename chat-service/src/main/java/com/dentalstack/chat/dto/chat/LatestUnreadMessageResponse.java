package com.dentalstack.chat.dto.chat;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LatestUnreadMessageResponse {

    private Long chatId;
    private Long patientId;
    private Long doctorId;
    private String message;
    private String[] imageName;
    private String doctorName;
    private String doctorProfile;
    private Long doctorProfileId;
    private LocalDateTime createdDate;
    private Boolean showPopup;
}
