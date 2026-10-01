package com.dentalstack.chat.dto.chat;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatImageUrlOfPatient {

    private Long patientId;

    private String[] imageUrl;

    private LocalDateTime addedAt;

    private Long alignerJourneyId;
}
