package com.dentalstack.chat.dto.chat;

import com.dentalstack.chat.dto.file.FileDetailsV2;
import com.dentalstack.chat.entity.Chat;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatResponseV2 {
    private Long chatId;
    private String message;
    private Long doctorId;
    private Long patientId;
    private List<FileDetailsV2> files;
    private LocalDateTime createdDate;
    private String createdBy;
    private String roleName;
    private String profileImage;
    private String patientName;
    private Long alignerJourneyId;
    private JsonNode additionalData;

    public static ChatResponseV2 from(
            Chat chat, ChatPatientResponse patientResponse, Long alignerJourneyId, Map<Long, FileDetailsV2> filesMap) {
        ZoneId desiredTimeZone = ZoneId.of("Asia/Kolkata");
        ZonedDateTime zonedDateTime = chat.getCreatedAt().atZone(desiredTimeZone);

        List<FileDetailsV2> files = chat.getFileIds() == null
                ? List.of()
                : chat.getFileIds().stream()
                        .map(filesMap::get)
                        .filter(Objects::nonNull)
                        .toList();

        return ChatResponseV2.builder()
                .chatId(chat.getId())
                .message(chat.getMessage())
                .files(files)
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
