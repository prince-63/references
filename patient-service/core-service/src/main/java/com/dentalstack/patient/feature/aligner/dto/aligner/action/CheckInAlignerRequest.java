package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.dto.aligner.ChangeAlignerRequest;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.CheckInSeverity;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CheckInAlignerRequest {
    private long userId;

    @NotNull
    private UserType userType;

    private long alignerJourneyId;
    private int alignerNo;

    private AlignerFeedbackRequest feedback;
    private List<ChangeAlignerRequest.PhotoFileMapping> withAlignerPhotoFiles;
    private List<ChangeAlignerRequest.PhotoFileMapping> withoutAlignerPhotoFiles;
    private CheckInSeverity severity;
    private Long profileId;
}
