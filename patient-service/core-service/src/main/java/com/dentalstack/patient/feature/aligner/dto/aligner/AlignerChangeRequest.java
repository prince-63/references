package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AlignerChangeRequest {
    private Long patientId;
    private Long alignerJourneyId;
    private Integer newAlignerNo;

    @NotNull
    private LocalDate previousAlignerChangeDate;

    private AlignerActionType alignerActionType;

    @Nullable
    private List<PhotoFileMapping> withPreviousAlignerPhotoFiles;

    @Nullable
    private List<PhotoFileMapping> withNewAlignerPhotoFiles;

    @Nullable
    private List<PhotoFileMapping> withoutNewAlignerPhotoFiles;

    @Nullable
    private Boolean isManual;

    private LocalTime previousAlignerChangeTime;

    public static AlignerChangeRequest from(
            AlignerJourney alignerJourney, Integer newAlignerNo, LocalDate previousAlignerChangeDate) {
        return AlignerChangeRequest.builder()
                .patientId(alignerJourney.getPatient().getId())
                .alignerJourneyId(alignerJourney.getId())
                .newAlignerNo(newAlignerNo)
                .previousAlignerChangeDate(previousAlignerChangeDate)
                .alignerActionType(AlignerActionType.ALIGNER_CHANGE)
                .build();
    }

    public static AlignerChangeRequest manualAlignerChange(
            AlignerJourney alignerJourney, Integer newAlignerNo, LocalDate previousAlignerChangeDate) {
        return AlignerChangeRequest.builder()
                .patientId(alignerJourney.getPatient().getId())
                .alignerJourneyId(alignerJourney.getId())
                .newAlignerNo(newAlignerNo)
                .previousAlignerChangeDate(previousAlignerChangeDate)
                .alignerActionType(AlignerActionType.ALIGNER_CHANGE)
                .isManual(true)
                .build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class PhotoFileMapping {
        private String originalFilename;
        private String saveAsFilename;
    }
}
