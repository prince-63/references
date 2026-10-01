package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InactivateActionRequest {
    @NotNull
    private List<Long> actionsIds;

    private long doctorId;
}
