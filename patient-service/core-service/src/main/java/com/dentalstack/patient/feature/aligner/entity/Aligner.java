package com.dentalstack.patient.feature.aligner.entity;

import com.dentalstack.patient.feature.aligner.dto.aligner.NewAlignerDetails;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerChangeActionMetadata;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProduction;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionOrder;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerChangeStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner",
        indexes = {
            @Index(name = "IX_aligner_aligner_journey_id", columnList = "aligner_journey_id"),
            @Index(name = "IX_aligner_sr_no", columnList = "srNo"),
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class Aligner extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int srNo;

    private LocalDate startDate;

    private LocalDate endDate;

    @Nullable
    private LocalDate changeDate;

    private LocalTime time;

    @NotNull
    @Enumerated(EnumType.STRING)
    private JawType jawType;

    private int noOfDaysToWear;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_journey_id")
    @ToString.Exclude
    private AlignerJourney alignerJourney;

    @OneToMany(mappedBy = "aligner", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<AlignerPhoto> photos = new ArrayList<>();

    @OneToMany(mappedBy = "aligner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<AlignerAction> actions = new ArrayList<>();

    @OneToMany(mappedBy = "aligner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<DailyAlignerWearTime> dailyWearTimeRecords = new ArrayList<>();

    @OneToMany(mappedBy = "aligner", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<AlignerFeedback> feedbacks = new ArrayList<>();

    @OneToOne(mappedBy = "aligner", cascade = CascadeType.ALL)
    private AlignerProduction alignerProduction;

    public static Aligner forNewTreatment(
            NewAlignerDetails alignerDetails,
            AlignerJourney alignerJourney,
            @Nullable AlignerProductionLab productionLab,
            AlignerProductionOrder productionOrder,
            @Nullable Integer startAlignerNo,
            @NotNull Tracking tracking) {
        var srNo = alignerDetails.getAlignerNo();
        var aligner = Aligner.builder()
                .alignerJourney(alignerJourney)
                .srNo(srNo)
                .startDate(alignerDetails.getStartDate())
                .endDate(alignerDetails.getEndDate())
                .jawType(alignerDetails.getJawType())
                .noOfDaysToWear(alignerDetails.getNoOfDaysToWear())
                .time(LocalTime.now())
                .build();

        ProductionSubStatus productionSubStatus;
        LocalDate currentDate = LocalDate.now();

        if (startAlignerNo != null && srNo > startAlignerNo) {
            productionSubStatus = ProductionSubStatus.UNPROCESSED;
        } else if (alignerDetails.getStartDate().isAfter(currentDate)) {
            productionSubStatus = ProductionSubStatus.UNPROCESSED;
        } else {
            productionSubStatus = ProductionSubStatus.ISSUED_TO_PATIENT;
        }

        var alignerProduction = AlignerProduction.builder()
                .aligner(aligner)
                .alignerProductionLab(productionLab)
                .alignerProductionOrder(productionOrder)
                .build();
        alignerProduction.changeStatus(productionSubStatus);
        aligner.setAlignerProduction(alignerProduction);

        return aligner;
    }

    public static Aligner from(NewAlignerDetails alignerDetails, AlignerJourney alignerJourney) {
        return Aligner.builder()
                .alignerJourney(alignerJourney)
                .srNo(alignerDetails.getAlignerNo())
                .startDate(alignerDetails.getStartDate())
                .endDate(alignerDetails.getEndDate())
                .jawType(alignerDetails.getJawType())
                .noOfDaysToWear(alignerDetails.getNoOfDaysToWear())
                .build();
    }

    public void update(@Nullable NewAlignerDetails newAlignerDetails) {
        if (newAlignerDetails == null) return;
        this.srNo = newAlignerDetails.getAlignerNo();
        this.jawType = newAlignerDetails.getJawType();
        this.startDate = newAlignerDetails.getStartDate();
        this.endDate = newAlignerDetails.getEndDate();
        this.noOfDaysToWear = newAlignerDetails.getNoOfDaysToWear();
    }

    @SuppressWarnings("UnusedReturnValue")
    public DailyAlignerWearTime addOrUpdateDailyWearTimeRecord(long durationInSec, LocalDate dateToUpdate) {
        Optional<DailyAlignerWearTime> optionalWearTime = dailyWearTimeRecords.stream()
                .filter(dailyAlignerWearTime -> dailyAlignerWearTime.getDate().equals(dateToUpdate))
                .findFirst();

        DailyAlignerWearTime wearTime;
        if (optionalWearTime.isPresent()) {
            wearTime = optionalWearTime.get();
            wearTime.updateStatus(durationInSec);
        } else {
            wearTime = DailyAlignerWearTime.newRecord(dateToUpdate, this);
            wearTime.updateStatus(durationInSec);

            if (dailyWearTimeRecords == null) {
                dailyWearTimeRecords = new ArrayList<>();
            }

            dailyWearTimeRecords.add(wearTime);

            log.info(
                    "Creating new daily wear time record for aligner with no {} in journey {}",
                    srNo,
                    alignerJourney.getId());
        }

        return wearTime;
    }

    public long totalWearTimeInSecs() {
        return getDailyWearTimeRecords().stream()
                .map(DailyAlignerWearTime::getTotalWearTimeSecs)
                .reduce(0L, Long::sum);
    }

    public long totalWearTimeInSecs(LocalDate startDate, LocalDate endDate) {
        return getDailyWearTimeRecords().stream()
                .filter(record -> !(record.getDate().isBefore(startDate)
                        || record.getDate().isAfter(endDate)))
                .map(DailyAlignerWearTime::getTotalWearTimeSecs)
                .reduce(0L, Long::sum);
    }

    public long totalDaysToWear() {
        if (startDate == null || endDate == null) return 0;
        return startDate.until(endDate, ChronoUnit.DAYS) + 1;
    }

    @Nullable
    public Float avgWearTimeInSecs(
            boolean truncateByTreatmentActualStartDate, boolean truncateByTreatmentActualEndDate) {
        LocalDate start = startDate;
        LocalDate end = changeDate != null ? changeDate : endDate;
        var actualEndDate = alignerJourney.actualEndDate();
        var actualStartDate = alignerJourney.actualStartDate();

        if (truncateByTreatmentActualStartDate
                && start != null
                && actualStartDate != null
                && start.isBefore(actualStartDate)) {
            start = actualStartDate;
        }
        if (truncateByTreatmentActualEndDate && end != null && actualEndDate != null && end.isAfter(actualEndDate)) {
            end = actualEndDate;
        }
        if (start == null || end == null || start.isAfter(end)) return 0F;

        var today = LocalDate.now();
        if (!today.isAfter(endDate)) {
            end = today.minusDays(1);
        }

        return avgWearTimeInSecs(start, end);
    }

    public long noOfDaysWorn(
            boolean truncateByTreatmentActualStartDate,
            boolean truncateByTreatmentActualEndDate,
            boolean includeOngoingDay) {
        LocalDate start = startDate;
        LocalDate end = changeDate != null ? changeDate : endDate;
        var actualEndDate = alignerJourney.actualEndDate();
        var actualStartDate = alignerJourney.actualEndDate();

        if (truncateByTreatmentActualStartDate
                && start != null
                && actualStartDate != null
                && start.isBefore(actualStartDate)) {
            start = actualStartDate;
        }
        if (truncateByTreatmentActualEndDate && end != null && actualEndDate != null && end.isAfter(actualEndDate)) {
            end = actualEndDate;
        }
        if (start == null || end == null || start.isAfter(end)) return 0;

        var today = LocalDate.now();
        if (today.isBefore(endDate)) {
            end = today;
        }

        return startDate.until(end, ChronoUnit.DAYS) + (includeOngoingDay ? 1 : 0);
    }

    @Nullable
    public Float avgWearTimeInSecs(@NotNull LocalDate start, @NotNull LocalDate end) {
        if (ChronoUnit.DAYS.between(start, end) + 1 <= 0) {
            return null;
        }

        return totalWearTimeInSecs(start, end) / (float) (ChronoUnit.DAYS.between(start, end) + 1);
    }

    @Nullable
    public Float avgWearTimeInSecsBasedOnCurrentAligner() {
        var currentAlignerNo = alignerJourney.getCurrentAlignerNo();
        if (currentAlignerNo == null || srNo > currentAlignerNo || srNo < alignerJourney.getStartAlignerNo())
            return null;

        LocalDate start = startDate;
        if (srNo == alignerJourney.getStartAlignerNo()) {
            start = alignerJourney.actualStartDate();
        }

        if (start.equals(LocalDate.now())) {
            return null;
        }

        return avgWearTimeInSecs(true, true);
    }

    public Optional<AlignerPhoto> getAlignerPhoto(String photoFilename) {
        return photos.stream()
                .filter(p -> p.getImageName().equals(photoFilename))
                .findFirst();
    }

    @Nullable
    public Compliance complianceBasedOnCurrentAligner() {
        var currentAlignerNo = alignerJourney.getCurrentAlignerNo();
        if (currentAlignerNo == null || srNo > currentAlignerNo || srNo < alignerJourney.getStartAlignerNo())
            return null;

        return compliance();
    }

    @Nullable
    public Compliance compliance() {
        if (startDate == null || endDate == null) {
            return null;
        }

        LocalDate start = startDate;
        LocalDate end = endDate;
        var today = LocalDate.now();
        if (srNo == alignerJourney.getStartAlignerNo()) {
            start = alignerJourney.actualStartDate();
        }

        if (start == null || !start.isBefore(today) || start.equals(today)) return null;

        if (!today.isAfter(endDate)) {
            end = today.minusDays(1);
        }

        if (start == end) {
            return null;
        }
        if (avgWearTimeInSecs(start, end) == null) {
            return null;
        }

        float perWearTime = avgWearTimeInSecs(start, end) / (alignerJourney.getRecommendedHoursToWearAligners() * 36F);
        if (perWearTime > 90) return Compliance.GOOD;
        else if (perWearTime > 80) return Compliance.AVERAGE;
        return Compliance.POOR;
    }

    public Integer dayRemaining() {
        if (endDate == null) return null;

        LocalDate now = LocalDate.now();
        if (endDate.isBefore(now)) return 0;

        return (int) ChronoUnit.DAYS.between(now, endDate) + 1;
    }

    @Nullable
    public AlignerChangeStatus alignerChangeStatus() {
        if (changeDate == null) {
            return null;
        }

        if (changeDate.isBefore(endDate)) return AlignerChangeStatus.EARLY;
        else if (changeDate.isAfter(endDate)) return AlignerChangeStatus.DELAYED;
        return AlignerChangeStatus.ON_TIME;
    }

    @Nullable
    public Integer changeOffset() {
        if (changeDate == null || endDate == null) return null;

        return Math.toIntExact(endDate.until(changeDate, ChronoUnit.DAYS));
    }

    public int calculateOverdue(Aligner aligner) {
        if (aligner.getEndDate() == null) {
            return 0;
        }
        LocalDate now = LocalDate.now();
        if (aligner.getChangeDate() != null) {
            return Math.toIntExact(aligner.getEndDate().until(aligner.getChangeDate(), ChronoUnit.DAYS));
        } else {
            return (int) ChronoUnit.DAYS.between(now, aligner.getEndDate());
        }
    }

    public void validateAllActions() {
        for (AlignerAction action : this.actions) {
            if (action.getType().equals(AlignerActionType.ALIGNER_CHANGE)) {
                action.setValidated(true);
                action.setActive(false);
            }
        }
    }

    public static int calculateOverdueForAction(Aligner aligner, AlignerAction action) {
        AlignerChangeActionMetadata metadata = null;

        if (action.getMetadata().getType().equals(AlignerActionType.ALIGNER_CHANGE)) {
            metadata = (AlignerChangeActionMetadata) action.getMetadata();
        }
        if (aligner.getEndDate() == null) {
            return 0;
        }

        LocalDate now = LocalDate.now();

        if (aligner.getChangeDate() != null) {
            return Math.toIntExact(aligner.getEndDate().until(aligner.getChangeDate(), ChronoUnit.DAYS));
        } else {
            if (metadata != null && metadata.getChangeDate() != null) {
                return Math.toIntExact(metadata.getAlignerEndDate().until(metadata.getChangeDate(), ChronoUnit.DAYS));
            } else {
                return (int) ChronoUnit.DAYS.between(now, aligner.getEndDate());
            }
        }
    }
}
