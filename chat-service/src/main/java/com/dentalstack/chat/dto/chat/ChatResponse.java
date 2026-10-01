package com.dentalstack.chat.dto.chat;

import com.dentalstack.chat.entity.Chat;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.regex.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatResponse {

    private Long chatId;

    private String message;

    private Long doctorId;

    private Long patientId;

    private String[] imageName;

    private LocalDateTime createdDate;
    ;

    private String createdBy;

    private String roleName;

    private String profileImage;

    private String patientName;

    private Long alignerJourneyId;

    private JsonNode additionalData;

    public static ChatResponse from(Chat chat, ChatPatientResponse patientResponse, Long alignerJourneyId) {
        ZoneId desiredTimeZone = ZoneId.of("Asia/Kolkata");
        ZonedDateTime zonedDateTime = chat.getCreatedAt().atZone(desiredTimeZone);

        return ChatResponse.builder()
                .chatId(chat.getId())
                .message(chat.getMessage())
                .imageName(chat.getImageName().split(Pattern.quote(",")))
                .doctorId(chat.getDoctorId())
                .patientId(chat.getPatientId())
                .createdDate(zonedDateTime.toLocalDateTime())
                .createdBy(chat.getCreatedBy())
                .roleName(chat.getRoleName())
                .alignerJourneyId(alignerJourneyId)
                .profileImage(patientResponse != null ? patientResponse.getProfileImage() : "")
                .patientName(
                        patientResponse != null
                                ? (patientResponse.getFirstName() + " " + patientResponse.getLastName())
                                : "")
                .additionalData(chat.getAdditionalData())
                .build();
    }
}
