package com.dentalstack.patient.feature.vsp.dto.request;

import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class UpdateTreatmentPlanRequest {

    private Long profileId;

    @NotNull
    private Long planId;

    private String planName;
    private String labComments;
    private VspTreatmentPlanStatus status;

    private List<Long> attachmentFileIds = new ArrayList<>();
    private List<Long> removeAttachmentFileIds = new ArrayList<>();

    @Valid
    private List<SubPlanStatusUpdate> subPlanStatusUpdates = new ArrayList<>();

    @Data
    public static class SubPlanStatusUpdate {

        @NotNull
        private Long subPlanId;

        @NotNull
        private VspTreatmentPlanStatus status;
    }
}
