package com.dentalstack.patient.feature.vsp.dto.request;

import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanStatus;
import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class CreateTreatmentPlanRequest {

    private Long profileId;

    @NotNull
    private String orderId;

    @NotBlank
    private String planName;

    @NotNull
    private VspTreatmentPlanType planType;

    private Integer planIndex;

    @Valid
    private List<CreateSubPlanRequest> subPlans = new ArrayList<>();

    private List<Long> attachmentFileIds = new ArrayList<>();

    private String labComments;

    private VspTreatmentPlanStatus status;

    @Data
    public static class CreateSubPlanRequest {

        @NotBlank
        private String subPlanName;

        private Integer subPlanIndex;
    }
}
