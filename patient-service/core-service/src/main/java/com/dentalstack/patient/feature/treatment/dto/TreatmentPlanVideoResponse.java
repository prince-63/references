package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.entity.TreatmentPlanVideoFile;
import com.dentalstack.patient.feature.treatment.enums.TreatmentPlanVideoTags;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TreatmentPlanVideoResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private TreatmentPlanVideoTags treatmentPlanVideoTags;
    private String videoUrl;
    private boolean isVideoToDisplayToPatient;

    public static TreatmentPlanVideoResponse from(TreatmentPlanVideoFile videoFile) {
        return TreatmentPlanVideoResponse.builder()
                .treatmentPlanVideoTags(videoFile.getTreatmentPlanVideoTags())
                .videoUrl(videoFile.getVideoUrl())
                .isVideoToDisplayToPatient(videoFile.isVideoDisplayToPatient())
                .build();
    }
}
