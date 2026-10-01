package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.dto.feedback.AlignerChangeFeedbackRequest;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ChangeAlignerRequest {
    private Long patientId;
    private Long alignerJourneyId;
    private Integer newAlignerNo;

    @NotNull
    private LocalDate previousAlignerChangeDate;

    private List<AlignerChangeFeedbackRequest> alignerFeedbacks;

    private List<PhotoFileMapping> withPreviousAlignerPhotoFiles;
    private List<PhotoFileMapping> withNewAlignerPhotoFiles;
    private List<PhotoFileMapping> withoutNewAlignerPhotoFiles;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class PhotoFileMapping {
        private String originalFilename;
        private String saveAsFilename;
    }
}
