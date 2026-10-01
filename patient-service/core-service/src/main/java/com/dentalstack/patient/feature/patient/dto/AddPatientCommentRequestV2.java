package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.enums.OrderCommentType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddPatientCommentRequestV2 {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Profile ID is required")
    private Long profileId;

    private Long doctorId;

    private String notes;

    private String remark;

    private Long taskId;

    @NotNull(message = "Comment type is required")
    private OrderCommentType commentType;

    private Long commentAddedForProfileId;
}
