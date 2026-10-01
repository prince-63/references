package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import com.dentalstack.patient.feature.aligner.exception.aligner.InvalidTreatmentCreationRequestException;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateAlignerJourneyRequest {
    private long patientId;

    @NotNull
    private String treatmentType;

    private String treatmentSubType;

    private Long productionLabId;

    private String doctorName;

    private Long doctorId;

    private String alignerUpdateStatus;

    private List<NewAlignerDetails> aligners;

    private int daysToWearEachAligner;

    @Min(value = 1)
    private int recommendedHoursToWearAligners;

    @Nullable
    private Integer currentAlignerNo;

    private LocalDate currentAlignerStartDate;

    @NotNull
    private TreatmentStage treatmentStage;

    private String brandName;

    @Nullable
    private Boolean isTreatmentRefinement;

    @Parameter(
            description = "True means treatment plan is ready to be displayed to the patient. "
                    + "This field should be false for treatment plans saved to be edited later.",
            required = true)
    private boolean creationComplete;

    public void validate() {
        if (currentAlignerNo == null) {
            if (treatmentStage.equals(TreatmentStage.NEW))
                throw new InvalidTreatmentCreationRequestException(
                        "Current aligner must be set for the new treatment.");
        } else {
            if (aligners == null || currentAlignerNo < 1 || currentAlignerNo > aligners.size()) {
                throw new InvalidTreatmentCreationRequestException(
                        "Current aligner number must be between 1 and number of aligners.");
            }
        }
    }

    public static CreateAlignerJourneyRequest from(
            List<NewAlignerDetails> details,
            com.dentalstack.patient.feature.aligner.dto.aligner.v2.CreateAlignerJourneyRequest request,
            TreatmentPlan treatmentPlan,
            TreatmentStage treatmentStage) {
        return CreateAlignerJourneyRequest.builder()
                .patientId(treatmentPlan.getPatient().getId())
                .treatmentType((treatmentPlan.getTreatmentType()))
                .treatmentSubType(treatmentPlan.getTreatmentType())
                .doctorName(request.getDoctorName())
                .doctorId(treatmentPlan.getDoctorId())
                .aligners(details)
                .daysToWearEachAligner(treatmentPlan.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(treatmentPlan.getRecommendedHoursToWearAligners())
                .currentAlignerNo(request.getCurrentAlignerDetails().getNumber())
                .currentAlignerStartDate(request.getCurrentAlignerDetails().getStartDate())
                .treatmentStage(treatmentStage)
                .creationComplete(true)
                .productionLabId(treatmentPlan.getProductionLabId())
                .brandName(treatmentPlan.getBrandName())
                .isTreatmentRefinement(request.getIsTreatmentRefinement())
                .build();
    }
}
