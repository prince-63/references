package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerNotFoundException;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Slf4j
public class UpdateAlignerJourneyRequest {
    private long alignerJourneyId;
    private Long updaterUserId;

    @NotNull
    private UserType updaterUserType;

    private String treatmentType;
    private String treatmentSubType;
    private String brand;
    private TreatmentStage treatmentStage;

    private int daysToWearEachAligner;
    private int recommendedHoursToWearAligners;

    private Integer currentAlignerNo;

    private List<NewAlignerDetails> aligners;

    private LocalDate doctorTreatmentStartDate;

    @Parameter(
            description =
                    "The treatment plan is considered active if it is ready to be displayed to the patient. This field should"
                            + " be false for treatment plans saved to be edited later.",
            required = true)
    private boolean active;

    public Integer getCurrentAlignerNo(AlignerJourney alignerJourney) {
        if (currentAlignerNo != null) {
            if ((aligners != null
                            && !aligners.isEmpty()
                            && (currentAlignerNo < 1 || currentAlignerNo > aligners.size()))
                    || (!alignerJourney.getAligners().isEmpty()
                            && (currentAlignerNo < 1
                                    || currentAlignerNo
                                            > alignerJourney.getAligners().size()))) {
                throw new BadRequestException("Current aligner number must be between 1 and number of aligners.");
            }
        }
        return currentAlignerNo;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateDetails {
        private boolean currentAlignerWearDaysUpdated;

        @Nullable
        private Integer updatedCurrentAlignerDayToWear;

        @Nullable
        private LocalDate updatedCurrentAlignerEndDate;

        private boolean subsequentAlignersWearDaysUpdated;

        @Nullable
        private Integer subsequentAlignersDayToWear;

        private boolean alignerStartDateUpdated;
        private boolean currentAlignerNoSet;
        private boolean doctorTreatmentStartDateSet;
        private boolean doctorTreatmentStartDateUpdated;
    }

    public UpdateDetails updateDetails(AlignerJourney oldAlignerJourney) {
        boolean currentAlignerWearDaysUpdated = false;
        boolean subsequentAlignersWearDaysUpdated = false;
        Integer updatedCurrentAlignerDayToWear = null;
        Integer subsequentAlignersDayToWear = null;
        LocalDate updatedCurrentAlignerEndDate = null;
        boolean alignerStartDateUpdated = false;
        boolean currentAlignerNoSet = false;
        boolean doctorTreatmentStartDateSet = false;
        boolean doctorTreatmentStartDateUpdated = false;

        Integer oldCurrentAlignerNo = oldAlignerJourney.getCurrentAlignerNo();
        NewAlignerDetails updatedCurrentAligner = null;
        Aligner currentAligner = oldAlignerJourney.getCurrentAligner();
        if (currentAligner != null && oldCurrentAlignerNo.equals(currentAlignerNo)) {
            var optionalCurrentAligner = aligners.stream()
                    .filter(a -> a.getAlignerNo() == currentAlignerNo)
                    .findAny();
            if (optionalCurrentAligner.isPresent()) updatedCurrentAligner = optionalCurrentAligner.get();
        }

        if (currentAligner != null
                && updatedCurrentAligner != null
                && currentAligner.getNoOfDaysToWear() != updatedCurrentAligner.getNoOfDaysToWear()) {
            currentAlignerWearDaysUpdated = true;
            updatedCurrentAlignerDayToWear = updatedCurrentAligner.getNoOfDaysToWear();
            updatedCurrentAlignerEndDate = updatedCurrentAligner.getEndDate();
        }

        for (var ua : aligners) {
            try {
                Aligner oldAligner = oldAlignerJourney.getAligner(ua.getAlignerNo());
                if (!subsequentAlignersWearDaysUpdated && ua.getAlignerNo() > currentAlignerNo) {
                    if (oldAligner.getNoOfDaysToWear() != ua.getNoOfDaysToWear()) {
                        subsequentAlignersWearDaysUpdated = true;
                        subsequentAlignersDayToWear = ua.getNoOfDaysToWear();
                        break;
                    }
                }

                if (!alignerStartDateUpdated && ua.getStartDate() != oldAligner.getStartDate()) {
                    alignerStartDateUpdated = true;
                }

            } catch (AlignerNotFoundException ignored) {
            }
        }

        currentAlignerNoSet = oldAlignerJourney.getCurrentAlignerNo() == null
                && oldAlignerJourney.getStartAlignerNo() == null
                && currentAlignerNo != null;

        doctorTreatmentStartDateSet =
                oldAlignerJourney.getDoctorTreatmentStartDate() == null && doctorTreatmentStartDate != null;
        doctorTreatmentStartDateUpdated = oldAlignerJourney.getDoctorTreatmentStartDate() != null
                && !oldAlignerJourney.getDoctorTreatmentStartDate().equals(doctorTreatmentStartDate);

        return new UpdateDetails(
                currentAlignerWearDaysUpdated,
                updatedCurrentAlignerDayToWear,
                updatedCurrentAlignerEndDate,
                subsequentAlignersWearDaysUpdated,
                subsequentAlignersDayToWear,
                alignerStartDateUpdated,
                currentAlignerNoSet,
                doctorTreatmentStartDateSet,
                doctorTreatmentStartDateUpdated);
    }
}
