package com.dentalstack.patient.feature.chat.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateAlignerCheckInRequest {

    @NotNull(message = "Chat ID is required")
    private Long chatId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Aligner number is required")
    private Integer alignerNumber;

    private Integer startAlignerNumber;

    private Integer endAlignerNumber;

    private String notes;

    private Integer totalAligners;
    private Long profileId;
    private Long doctorId;
}
