package com.dentalstack.patient.feature.treatment.dto;

import static java.lang.Math.*;

import com.dentalstack.patient.feature.storage.dto.PreAlignerPhotoDetails;
import com.dentalstack.patient.feature.treatment.dto.production.AlignerProductionOrderDetails;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourneyNote;
import com.dentalstack.patient.feature.treatment.enums.Compliance;
import com.dentalstack.patient.feature.treatment.enums.CreationStatus;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import com.dentalstack.patient.feature.treatment.enums.TreatmentStage;
import com.dentalstack.patient.global.enums.Language;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.function.Consumer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerJourneyDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private Long doctorId;
    private Long alignerJourneyId;

    private String treatmentType;
    private String treatmentSubType;
    private String brand;
    private TreatmentStage treatmentStage;
    private ProgressStatus progressStatus;
    private CreationStatus creationStatus;
    private Integer treatmentCompletionPercentage;

    @Schema(
            title = "No. of days remaining for treatment completion.",
            description =
                    """
This number will freeze when the current aligner is not changed even though end day has passed.
Once the aligner has been changed, it will start decreasing as the day passes.
            """)
    private Integer daysRemainingForTreatmentCompletion;

    private Compliance currentAlignerCompliance;

    private Integer daysRemainingOnCurrentAligner;

    @Builder.Default
    private List<AlignerDetails> aligners = new ArrayList<>();

    @Builder.Default
    private List<CustomReminderDetails> customReminders = new ArrayList<>();

    @Builder.Default
    private List<DefaultReminderDetails> defaultReminders = new ArrayList<>();

    @Builder.Default
    private List<PreAlignerPhotoDetails> preAlignerPhotos = new ArrayList<>();

    private int totalAligners;

    private int daysToWearEachAligner;
    private int recommendedHoursToWearAligners;
    private Integer currentAlignerNo;
    private boolean askPatientForCurrentAlignerNo;

    private Long numbersOfDaysAlignersWornTillNow;
    private long numbersOfDaysCurrentAlignerWornTillNow;

    @Schema(title = "Treatment start date set by the doctor")
    private LocalDate doctorTreatmentStartDate;

    @Nullable
    @Schema(title = "The date on which patient actually started the treatment")
    private LocalDate patientTreatmentStartDate;

    @Schema(
            title = "The start date of the first aligner",
            description =
                    """
            It is not necessary that this date is equal to patient treatment start date, specially when treatment is the mid treatment.
            """)
    private LocalDate firstAlignerStartDate;

    @Schema(
            title = "The date at which treatment should ideally end as per doctor's plan",
            description = "This date is equal to end date of the last aligner")
    private LocalDate doctorTreatmentEndDate;

    @Schema(
            title = "The date at which treatment actually ended",
            description = "This date is equal to change date of the last aligner")
    private LocalDate patientTreatmentEndDate;

    private LocalDate nextAlignerChangeDate;

    private boolean askPatientForTreatmentStartDate;

    private List<AlignerProductionOrderDetails> productionOrder;

    private List<AlignerJourneyNoteDetails> notes;

    private List<Integer> upperRange;
    private List<Integer> lowerRange;
    private String treatmentPlanName;
    private Integer initialAlignerNumber;

    @Nullable
    private AlignerChangingDetails alignerChangingDetails;

    private boolean isAlignerCheckInCompletedToday;
    private AlignerDetails currentAligner;

    public static AlignerJourneyDetails from(AlignerJourney alignerJourney) {
        var numbersOfDaysCurrentAlignerWornTillNow = 0L;
        var currentAligner = alignerJourney.getCurrentAligner();
        Compliance currentAlignerCompliance = null;
        if (currentAligner != null) {
            numbersOfDaysCurrentAlignerWornTillNow = currentAligner.noOfDaysWorn(false, true, true);
            currentAlignerCompliance = currentAligner.compliance();
        }
        Integer treatmentCompletionPercentage =
                toIntExact(round(floor(alignerJourney.treatmentCompletionPercentage(false, false))));

        var treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();
        var alignerDetailsMetadata = treatmentPlan.getAlignerDetailsMetadata();
        var upperRange = alignerDetailsMetadata.getUpperJawDetails().getRange();
        var lowerRange = alignerDetailsMetadata.getLowerJawDetails().getRange();

        final int[] rangeValues = determineOverallRange(upperRange, lowerRange);
        final int lowestSrNo = rangeValues[0];
        final int highestSrNo = rangeValues[1];

        var alignerDetails = alignerJourney.getAligners().stream()
                .sorted(Comparator.comparing(Aligner::getSrNo))
                .map(AlignerDetails::from)
                .filter(aligner -> {
                    int srNo = aligner.getSrNo();
                    return srNo >= lowestSrNo && srNo <= highestSrNo;
                })
                .toList();

        return AlignerJourneyDetails.builder()
                .alignerJourneyId(alignerJourney.getId())
                .doctorId(alignerJourney.getDoctorId())
                .patientId(alignerJourney.getPatient().getId())
                .treatmentType(alignerJourney.getTreatmentType())
                .treatmentSubType(alignerJourney.getTreatmentSubType())
                .brand(alignerJourney.getBrand())
                .daysRemainingOnCurrentAligner(alignerJourney.daysRemainingOnCurrentAligner())
                .treatmentStage(alignerJourney.getTreatmentStage())
                .creationStatus(alignerJourney.getCreationStatus())
                .progressStatus(alignerJourney.getProgressStatus())
                .treatmentCompletionPercentage(treatmentCompletionPercentage)
                .daysRemainingForTreatmentCompletion(alignerJourney.daysRemaining())
                .currentAlignerCompliance(currentAlignerCompliance)
                .nextAlignerChangeDate(alignerJourney.nextAlignerChangeDate())
                .totalAligners(alignerJourney.totalAligners())
                .daysToWearEachAligner(alignerJourney.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(alignerJourney.getRecommendedHoursToWearAligners())
                .numbersOfDaysAlignersWornTillNow(alignerJourney.numbersOfDaysAlignersWorn(true, true, true))
                .numbersOfDaysCurrentAlignerWornTillNow(numbersOfDaysCurrentAlignerWornTillNow)
                .currentAlignerNo(alignerJourney.getCurrentAlignerNo())
                .askPatientForCurrentAlignerNo(alignerJourney.shouldAskPatientForCurrentAlignerNo())
                .doctorTreatmentStartDate(alignerJourney.getDoctorTreatmentStartDate())
                .patientTreatmentStartDate(alignerJourney.getPatientTreatmentStartDate())
                .doctorTreatmentEndDate(alignerJourney.doctorTreatmentEndDate())
                .patientTreatmentEndDate(alignerJourney.patientTreatmentEndDate())
                .firstAlignerStartDate(alignerJourney.firstAlignerStartDate())
                .askPatientForTreatmentStartDate(alignerJourney.shouldAskPatientForTreatmentStartDate())
                .preAlignerPhotos(alignerJourney.getPreAlignerPhotos().stream()
                        .map(PreAlignerPhotoDetails::from)
                        .toList())
                .aligners(alignerDetails)
                .customReminders(CustomReminderDetails.fromSorted(alignerJourney.getCustomReminders()))
                .defaultReminders(DefaultReminderDetails.fromSorted(alignerJourney.getDefaultAlignerReminders()))
                .productionOrder(alignerJourney.getAlignerProductionOrders().stream()
                        .map(AlignerProductionOrderDetails::from)
                        .toList())
                .notes(alignerJourney.getNotes().stream()
                        .filter(AlignerJourneyNote::isActive)
                        .map(AlignerJourneyNoteDetails::from)
                        .toList())
                .upperRange(treatmentPlan
                        .getAlignerDetailsMetadata()
                        .getUpperJawDetails()
                        .getRange())
                .lowerRange(treatmentPlan
                        .getAlignerDetailsMetadata()
                        .getLowerJawDetails()
                        .getRange())
                .treatmentPlanName(
                        alignerJourney.getTracking().getTreatmentPlan().getTreatmentPlanName())
                .initialAlignerNumber(alignerJourney.getInitialAlignerNumber())
                .isAlignerCheckInCompletedToday(alignerJourney.isAlignerCheckInCompleted())
                .currentAligner(AlignerDetails.from(alignerJourney.getCurrentAligner()))
                .build();
    }

    public static AlignerJourneyDetails from(
            AlignerJourney alignerJourney, Aligner previousCurrentAligner, Aligner nextCurrentAligner) {
        var numbersOfDaysCurrentAlignerWornTillNow = 0L;
        var currentAligner = alignerJourney.getCurrentAligner();
        Compliance currentAlignerCompliance = null;
        if (currentAligner != null) {
            numbersOfDaysCurrentAlignerWornTillNow = currentAligner.noOfDaysWorn(false, true, true);
            currentAlignerCompliance = currentAligner.compliance();
        }
        Integer treatmentCompletionPercentage =
                toIntExact(round(floor(alignerJourney.treatmentCompletionPercentage(false, false))));

        var treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();
        var alignerDetailsMetadata = treatmentPlan.getAlignerDetailsMetadata();
        var upperRange = alignerDetailsMetadata.getUpperJawDetails().getRange();
        var lowerRange = alignerDetailsMetadata.getLowerJawDetails().getRange();

        final int[] rangeValues = determineOverallRange(upperRange, lowerRange);
        final int lowestSrNo = rangeValues[0];
        final int highestSrNo = rangeValues[1];

        var alignerDetails = alignerJourney.getAligners().stream()
                .sorted(Comparator.comparing(Aligner::getSrNo))
                .map(AlignerDetails::from)
                .filter(aligner -> {
                    int srNo = aligner.getSrNo();
                    return srNo >= lowestSrNo && srNo <= highestSrNo;
                })
                .toList();

        Language patientLanguage = alignerJourney.getPatient().getLanguage();

        return AlignerJourneyDetails.builder()
                .alignerJourneyId(alignerJourney.getId())
                .doctorId(alignerJourney.getDoctorId())
                .patientId(alignerJourney.getPatient().getId())
                .treatmentType(alignerJourney.getTreatmentType())
                .treatmentSubType(alignerJourney.getTreatmentSubType())
                .brand(alignerJourney.getBrand())
                .daysRemainingOnCurrentAligner(alignerJourney.daysRemainingOnCurrentAligner())
                .treatmentStage(alignerJourney.getTreatmentStage())
                .creationStatus(alignerJourney.getCreationStatus())
                .progressStatus(alignerJourney.getProgressStatus())
                .treatmentCompletionPercentage(treatmentCompletionPercentage)
                .daysRemainingForTreatmentCompletion(alignerJourney.daysRemaining())
                .currentAlignerCompliance(currentAlignerCompliance)
                .nextAlignerChangeDate(alignerJourney.nextAlignerChangeDate())
                .totalAligners(alignerJourney.totalAligners())
                .daysToWearEachAligner(alignerJourney.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(alignerJourney.getRecommendedHoursToWearAligners())
                .numbersOfDaysAlignersWornTillNow(alignerJourney.numbersOfDaysAlignersWorn(true, true, true))
                .numbersOfDaysCurrentAlignerWornTillNow(numbersOfDaysCurrentAlignerWornTillNow)
                .currentAlignerNo(alignerJourney.getCurrentAlignerNo())
                .askPatientForCurrentAlignerNo(alignerJourney.shouldAskPatientForCurrentAlignerNo())
                .doctorTreatmentStartDate(alignerJourney.getDoctorTreatmentStartDate())
                .patientTreatmentStartDate(alignerJourney.getPatientTreatmentStartDate())
                .doctorTreatmentEndDate(alignerJourney.doctorTreatmentEndDate())
                .patientTreatmentEndDate(alignerJourney.patientTreatmentEndDate())
                .firstAlignerStartDate(alignerJourney.firstAlignerStartDate())
                .askPatientForTreatmentStartDate(alignerJourney.shouldAskPatientForTreatmentStartDate())
                .preAlignerPhotos(alignerJourney.getPreAlignerPhotos().stream()
                        .map(PreAlignerPhotoDetails::from)
                        .toList())
                .aligners(alignerDetails)
                .customReminders(alignerJourney.getCustomReminders().stream()
                        .map(reminder -> CustomReminderDetails.from(reminder, patientLanguage))
                        .toList())
                .defaultReminders(alignerJourney.getDefaultAlignerReminders().stream()
                        .map(reminder -> DefaultReminderDetails.from(reminder, patientLanguage))
                        .toList())
                .productionOrder(alignerJourney.getAlignerProductionOrders().stream()
                        .map(AlignerProductionOrderDetails::from)
                        .toList())
                .notes(alignerJourney.getNotes().stream()
                        .filter(AlignerJourneyNote::isActive)
                        .map(AlignerJourneyNoteDetails::from)
                        .toList())
                .upperRange(treatmentPlan
                        .getAlignerDetailsMetadata()
                        .getUpperJawDetails()
                        .getRange())
                .lowerRange(treatmentPlan
                        .getAlignerDetailsMetadata()
                        .getLowerJawDetails()
                        .getRange())
                .treatmentPlanName(
                        alignerJourney.getTracking().getTreatmentPlan().getTreatmentPlanName())
                .initialAlignerNumber(alignerJourney.getInitialAlignerNumber())
                .isAlignerCheckInCompletedToday(alignerJourney.isAlignerCheckInCompleted())
                .alignerChangingDetails(AlignerChangingDetails.builder()
                        .isCurrentAlignerChanging(true)
                        .previousCurrentAligner(previousCurrentAligner.getSrNo())
                        .previousCurrentAlignerJawType(previousCurrentAligner.getJawType())
                        .nextCurrentAligner(nextCurrentAligner.getSrNo())
                        .nextCurrentAlignerJawType(nextCurrentAligner.getJawType())
                        .build())
                .currentAligner(AlignerDetails.from(alignerJourney.getCurrentAligner()))
                .build();
    }

    private static int[] determineOverallRange(List<Integer> upperRange, List<Integer> lowerRange) {
        final int[] lowestSrNo = {Integer.MAX_VALUE};
        final int[] highestSrNo = {Integer.MIN_VALUE};

        Consumer<List<Integer>> updateRange = range -> {
            if (range != null && !range.isEmpty()) {
                lowestSrNo[0] = Math.min(lowestSrNo[0], Collections.min(range));
                highestSrNo[0] = Math.max(highestSrNo[0], Collections.max(range));
            }
        };

        updateRange.accept(upperRange);
        updateRange.accept(lowerRange);

        if (lowestSrNo[0] == Integer.MAX_VALUE && highestSrNo[0] == Integer.MIN_VALUE) {
            return new int[] {1, 0};
        }

        return new int[] {lowestSrNo[0], highestSrNo[0]};
    }
}
