package com.dentalstack.patient.feature.chat.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageReadReceiptResponse {

    private Long id;
    private Long userProfileId;
    private String userName;
    private LocalDateTime readAt;
}
