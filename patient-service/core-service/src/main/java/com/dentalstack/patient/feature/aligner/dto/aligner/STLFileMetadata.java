package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class STLFileMetadata {
    public enum PrintingType {
        THREE_D_PRINTED,
        DIRECT_PRINTED,
        HOLLOW_D_PRINTED
    }

    public enum Status {
        STL_FILES_REQUESTED,
        STL_FILES_UPLOADED,
        APPROVED
    }

    @Enumerated(EnumType.STRING)
    private PrintingType printingType;

    private ZonedDateTime requestedAt;
    private String[] link;
    private Integer[] fileId;

    @Enumerated(EnumType.STRING)
    private Status status;

    private ZonedDateTime approvedOn;
    private ZonedDateTime uploadedOn;
}
