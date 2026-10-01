package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.user.enums.UserType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(title = "Change aligner request")
public class ChangeAlignerRequest {
    private long userId;

    @NotNull
    private UserType userType;

    private long alignerJourneyId;

    private int currentAlignerNo;
    private int nextAlignerNo;

    @NotNull
    private LocalDate changeDate;
}
