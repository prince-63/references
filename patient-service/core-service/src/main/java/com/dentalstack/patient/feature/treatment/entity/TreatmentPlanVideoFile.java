package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.treatment.enums.TreatmentPlanVideoTags;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "treatment_plan_video_file")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentPlanVideoFile extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private TreatmentPlanVideoTags treatmentPlanVideoTags;

    private String videoUrl;
    private long fileId;

    private boolean isVideoDisplayToPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id")
    private TreatmentPlan treatmentPlan;

    public static TreatmentPlanVideoFile from(
            TreatmentPlanVideoTags treatmentPlanVideoTags,
            String videoUrl,
            TreatmentPlanRequest request,
            long fileId,
            TreatmentPlan treatmentPlan) {
        return TreatmentPlanVideoFile.builder()
                .treatmentPlanVideoTags(treatmentPlanVideoTags)
                .videoUrl(videoUrl)
                .fileId(fileId)
                .isVideoDisplayToPatient(request.isVideoDisplayToPatient())
                .treatmentPlan(treatmentPlan)
                .build();
    }
}
