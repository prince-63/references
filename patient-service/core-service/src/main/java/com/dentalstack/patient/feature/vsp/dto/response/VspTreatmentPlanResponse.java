package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.vsp.entity.VspTreatmentPlan;
import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanStatus;
import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanType;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspTreatmentPlanResponse {

    private Long id;
    private String orderId;
    private String planName;
    private Integer planIndex;
    private VspTreatmentPlanType planType;

    private List<VspTreatmentSubPlanResponse> subPlans;

    private List<FileDetails> attachmentFiles;
    private String labComments;

    private VspTreatmentPlanStatus status;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static VspTreatmentPlanResponse from(VspTreatmentPlan p) {
        List<VspTreatmentSubPlanResponse> subPlanResponses = Collections.emptyList();
        if (p.getPlanType() == VspTreatmentPlanType.SINGLE_PLAN && p.getSubPlans() != null) {
            subPlanResponses = p.getSubPlans().stream()
                    .sorted(Comparator.comparingInt(sp -> (sp.getSubPlanIndex() != null ? sp.getSubPlanIndex() : 0)))
                    .map(VspTreatmentSubPlanResponse::from)
                    .collect(Collectors.toList());
        }

        return VspTreatmentPlanResponse.builder()
                .id(p.getId())
                .orderId(p.getVspOrder() != null ? p.getVspOrder().getId() : null)
                .planName(p.getPlanName())
                .planIndex(p.getPlanIndex())
                .planType(p.getPlanType())
                .subPlans(subPlanResponses)
                .attachmentFiles(
                        p.getAttachmentFiles().stream().map(FileDetails::from).collect(Collectors.toList()))
                .labComments(p.getLabComments())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
