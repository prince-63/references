package com.dentalstack.patient.feature.aligner.entity;

import static com.dentalstack.patient.feature.aligner.util.AlignerJourneyUtils.getTreatmentCompletionPercentage;

import com.dentalstack.patient.feature.aligner.dto.aligner.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.NewAlignerDetails;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionOrder;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.CreationStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import com.dentalstack.patient.feature.aligner.exception.aligner.*;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerChangeData;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Consumer;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner_journey",
        indexes = {
            @Index(name = "IX_aligner_journey_doctor_treatment_start_date", columnList = "doctorTreatmentStartDate"),
            @Index(name = "IX_aligner_journey_patient_id", columnList = "patient_id"),
            @Index(name = "IX_aligner_journey_doctor_id_progress_status", columnList = "doctorId, progressStatus"),
            @Index(name = "IX_aligner_journey_doctor_id", columnList = "doctorId"),
            @Index(name = "IX_aligner_journey_patient_id_progress_status", columnList = "patient_id, progressStatus"),
            @Index(
                    name = "IX_aligner_journey_creation_status_progress_status",
                    columnList = "creationStatus, progressStatus"),
            @Index(
                    name = "IX_aligner_journey_patient_id_creation_status_progress_status",
                    columnList = "patient_id, creationStatus, progressStatus"),
            @Index(
                    name = "IX_aligner_journey_patient_id_doctor_id_progress_status",
                    columnList = "patient_id, doctorId, progressStatus")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class AlignerJourney extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    @NotNull
    private long doctorId;

    private String treatmentType;
    private String treatmentSubType;

    @Nullable
    private String brand;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TreatmentStage treatmentStage;

    @NotNull
    @Enumerated(EnumType.STRING)
    private CreationStatus creationStatus;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProgressStatus progressStatus;

    @OneToMany(mappedBy = "alignerJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Aligner> aligners = new ArrayList<>();

    @OneToMany(mappedBy = "alignerJourney", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<CustomAlignerReminder> customReminders = new ArrayList<>();

    @OneToMany(mappedBy = "alignerJourney", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<DefaultAlignerReminder> defaultAlignerReminders = new ArrayList<>();

    @OneToMany(mappedBy = "alignerJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<PreAlignerPhoto> preAlignerPhotos = new ArrayList<>();

    @OneToMany(mappedBy = "alignerJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<AlignerJourneyNote> notes = new ArrayList<>();

    @OneToMany(mappedBy = "alignerJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<AlignerProductionOrder> alignerProductionOrders = new ArrayList<>();

    private int daysToWearEachAligner;
    private int recommendedHoursToWearAligners;
    private Integer currentAlignerNo;
    private Integer startAlignerNo;

    private LocalDate doctorTreatmentStartDate;
    private LocalDate patientTreatmentStartDate;

    private LocalDate patientTreatmentEndDate;
    private LocalDate doctorTreatmentEndDate;

    @NotNull
    @OneToOne(mappedBy = "alignerJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private Tracking tracking;

    private Integer initialAlignerNumber;
    private LocalDate wearTimeNotificationTriggeredAt;

    public static @NonNull AlignerJourney newTreatment(
            @NonNull CreateAlignerJourneyRequest request,
            Patient patient,
            @Nullable AlignerProductionLab productionLab,
            Tracking tracking) {
        final Integer currentAlignerNo = request.getCurrentAlignerNo();
        var startDate = request.getCurrentAlignerStartDate();

        var creationStatus = request.isCreationComplete() ? CreationStatus.DONE : CreationStatus.IN_PROGRESS;
        var progressStatus = ProgressStatus.NOT_STARTED;
        if ((creationStatus.equals(CreationStatus.DONE) && startDate != null && startDate.equals(LocalDate.now()))
                || request.getTreatmentStage().equals(TreatmentStage.MID)
                || creationStatus.equals(CreationStatus.DONE)
                        && startDate != null
                        && (startDate.isBefore(LocalDate.now()))) {
            progressStatus = ProgressStatus.IN_PROGRESS;
        }
        String productionLabName = productionLab == null ? null : productionLab.getName();

        AlignerJourney alignerJourney = AlignerJourney.builder()
                .patient(patient)
                .doctorId(request.getDoctorId())
                .treatmentType(request.getTreatmentType())
                .treatmentSubType(request.getTreatmentSubType())
                .brand(productionLabName != null ? productionLabName : "Clear Aligner")
                .treatmentStage(request.getTreatmentStage())
                .daysToWearEachAligner(request.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(request.getRecommendedHoursToWearAligners())
                .doctorTreatmentStartDate(request.getCurrentAlignerStartDate())
                .currentAlignerNo(currentAlignerNo)
                .initialAlignerNumber(currentAlignerNo)
                .startAlignerNo(currentAlignerNo)
                .creationStatus(creationStatus)
                .progressStatus(progressStatus)
                .patientTreatmentStartDate(LocalDate.now())
                .build();

        var productionOrder = AlignerProductionOrder.forNewTreatment(alignerJourney);

        List<Aligner> aligners = request.getAligners().stream()
                .map(alignerDetails -> Aligner.forNewTreatment(
                        alignerDetails, alignerJourney, productionLab, productionOrder, currentAlignerNo, tracking))
                .toList();
        alignerJourney.setAligners(aligners);

        alignerJourney.setAlignerProductionOrders(List.of(productionOrder));

        return alignerJourney;
    }

    public void updateAllAligners(List<NewAlignerDetails> newAligners) {
        Map<Integer, NewAlignerDetails> newAlignerMap = new HashMap<>();
        Map<Integer, Boolean> oldAlignerNoUpdated = new HashMap<>();
        for (var a : newAligners) {
            newAlignerMap.put(a.getAlignerNo(), a);
            oldAlignerNoUpdated.put(a.getAlignerNo(), false);
        }

        for (var a : aligners) {
            var no = a.getSrNo();
            if (newAlignerMap.containsKey(no)) {
                a.update(newAlignerMap.get(no));
                oldAlignerNoUpdated.put(no, true);
            }
        }

        for (var no : oldAlignerNoUpdated.keySet()) {
            boolean isOldAlignerUpdated = oldAlignerNoUpdated.get(no);
            if (!isOldAlignerUpdated) {
                Aligner newAligner = Aligner.from(newAlignerMap.get(no), this);
                aligners.add(newAligner);
            }
        }
    }

    public void validate() {
        if (aligners == null || aligners.isEmpty()) throw new AlignersNotSetForAlignerJourneyException(getId());
        if (doctorTreatmentStartDate == null) {
            throw new DoctorTreatmentStartDateNotSetException(getId());
        }
        if (currentAlignerNo == null) {
            throw new CurrentAlignerNotSetException(getId());
        }
        isTreatmentDeactivated();
    }

    public void isTreatmentDeactivated() {
        if (progressStatus.equals(ProgressStatus.DEACTIVATED)) {
            throw new AlignerJourneyDeactivatedException(getId());
        }
    }

    @Nullable
    public Aligner getCurrentAligner() {
        if (currentAlignerNo == null) return null;

        return aligners.stream()
                .filter(a -> a.getSrNo() == currentAlignerNo)
                .findFirst()
                .orElse(null);
    }

    public int totalAligners() {
        return aligners.size();
    }

    public float avgWearTimeInSecs() {
        if (aligners.isEmpty()) return 0.0f;

        var totalAligners = 0;
        var avgSum = 0.0f;
        for (var a : aligners) {
            if (a.getSrNo() < startAlignerNo || a.getSrNo() > currentAlignerNo) continue;

            avgSum += Optional.ofNullable(a.avgWearTimeInSecs(true, true)).orElse(0.0f);
            totalAligners += 1;
        }

        return totalAligners > 0 ? avgSum / totalAligners : 0.0f;
    }

    public long totalWearTimeInSecs() {
        if (aligners.isEmpty()) return 0L;

        return aligners.stream().map(Aligner::totalWearTimeInSecs).reduce(0L, Long::sum);
    }

    public long totalRecommendedWearTimeInSecsTillNow() {
        LocalDate startDate = getAligner(1).getStartDate();
        if (startDate == null) return 0L;

        LocalDate endDate = LocalDate.now();
        var daysTillNow = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        return daysTillNow * recommendedHoursToWearAligners * 3600L;
    }

    @Nullable
    public Long numbersOfDaysAlignersWorn(boolean actualStartDate, boolean actualEndDate, boolean includeOngoingDay) {
        var startDate = actualStartDate ? actualStartDate() : firstAlignerStartDate();
        if (startDate == null) return null;

        return switch (progressStatus) {
            case NOT_STARTED -> 0L;
            case COMPLETE, DISCARDED, DEACTIVATED -> {
                var endDate = actualEndDate ? actualEndDate() : lastAlignerEndDate();
                if (endDate == null) yield null;

                yield startDate.until(endDate, ChronoUnit.DAYS) + 1;
            }
            case IN_PROGRESS -> {
                var today = LocalDate.now();
                var endDate = actualEndDate ? actualEndDate() : lastAlignerEndDate();
                if (endDate == null) {
                    endDate = today;
                }

                if (today.isAfter(endDate)) {
                    yield startDate.until(endDate, ChronoUnit.DAYS) + 1;
                } else if (today.isBefore(startDate)) {
                    yield 0L;
                } else {
                    yield startDate.until(today, ChronoUnit.DAYS) + (includeOngoingDay ? 1 : 0);
                }
            }
        };
    }

    public float treatmentCompletionPercentage(boolean actualStartDate, boolean actualEndDate) {
        var startDate = actualStartDate ? actualStartDate() : firstAlignerStartDate();
        if (startDate == null) return 0.0F;

        var today = LocalDate.now();
        return switch (progressStatus) {
            case NOT_STARTED -> 0.0F;
            case COMPLETE, DISCARDED, IN_PROGRESS, DEACTIVATED -> {
                var endDate = actualEndDate ? actualEndDate() : lastAlignerEndDate();
                if (endDate == null) yield 0.0F;

                Aligner aligner = getCurrentAligner();
                if (aligner == null) yield 0.0F;

                var currentAlignerEndDate = aligner.getEndDate();
                if (currentAlignerEndDate == null) yield 0.0F;

                var currentDate = today;

                if (aligner.getChangeDate() == null && today.isAfter(currentAlignerEndDate)) {
                    currentDate = currentAlignerEndDate;
                }

                yield getTreatmentCompletionPercentage(startDate, endDate, currentDate);
            }
        };
    }

    public LocalDate actualStartDate() {
        if (patientTreatmentStartDate == null) return doctorTreatmentStartDate;
        return patientTreatmentStartDate;
    }

    public LocalDate doctorTreatmentStartDate() {
        return doctorTreatmentStartDate;
    }

    @Nullable
    public LocalDate actualEndDate() {
        return switch (progressStatus) {
            case IN_PROGRESS, NOT_STARTED -> null;
            case COMPLETE, DISCARDED, DEACTIVATED -> {
                if (patientTreatmentEndDate != null) yield patientTreatmentEndDate;

                yield doctorTreatmentEndDate;
            }
        };
    }

    public LocalDate firstAlignerStartDate() {
        return getAligner(1).getStartDate();
    }

    public LocalDate lastAlignerEndDate() {
        return getAligner(totalAligners()).getEndDate();
    }

    @Nullable
    public LocalDate doctorTreatmentEndDate() {
        if (doctorTreatmentEndDate != null) return doctorTreatmentEndDate;

        return lastAlignerEndDate();
    }

    @Nullable
    public LocalDate patientTreatmentEndDate() {
        if (patientTreatmentEndDate != null) return patientTreatmentEndDate;

        return getAligner(totalAligners()).getChangeDate();
    }

    @Nullable
    public LocalDate nextAlignerChangeDate() {
        var currentAligner = getCurrentAligner();
        if (currentAligner == null) return null;

        return currentAligner.getEndDate();
    }

    public boolean isAlignerCheckInToday() {
        var currentAligner = getCurrentAligner();
        if (currentAligner == null) return false;

        int currentAlignerSrNo = currentAligner.getSrNo();
        ZonedDateTime today =
                ZonedDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        for (int srNo = 1; srNo <= currentAlignerSrNo; srNo++) {
            var aligner = getAligner(srNo);
            if (aligner == null || aligner.getActions().isEmpty()) continue;

            List<AlignerAction> todayActions = aligner.getActions().stream()
                    .filter(action -> {
                        ZonedDateTime performedAt = action.getPerformedAt()
                                .withHour(0)
                                .withMinute(0)
                                .withSecond(0)
                                .withNano(0);
                        return performedAt.equals(today);
                    })
                    .sorted(Comparator.comparing(AlignerAction::getPerformedAt))
                    .toList();

            boolean lastActionWasCheckIn = false;

            for (AlignerAction action : todayActions) {
                if (action.getType() == AlignerActionType.CHECK_IN) {
                    lastActionWasCheckIn = true;
                } else if (action.getType() == AlignerActionType.ALIGNER_CHANGE
                        || action.getType() == AlignerActionType.FORCE_ALIGNER_CHANGE) {
                    lastActionWasCheckIn = false;
                }
            }

            if (lastActionWasCheckIn) {
                return true;
            }
        }
        return false;
    }

    public boolean isAlignerChangeToday() {
        var currentAligner = getCurrentAligner();
        if (currentAligner == null) return false;

        int currentAlignerSrNo = currentAligner.getSrNo();
        ZonedDateTime today =
                ZonedDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        for (int srNo = 1; srNo <= currentAlignerSrNo; srNo++) {
            var aligner = getAligner(srNo);
            if (aligner == null || aligner.getActions().isEmpty()) continue;

            boolean hasChangeToday = aligner.getActions().stream().anyMatch(action -> {
                ZonedDateTime performedAt = action.getPerformedAt()
                        .withHour(0)
                        .withMinute(0)
                        .withSecond(0)
                        .withNano(0);

                return performedAt.equals(today)
                        && (action.getType() == AlignerActionType.ALIGNER_CHANGE
                                || action.getType() == AlignerActionType.FORCE_ALIGNER_CHANGE);
            });

            if (hasChangeToday) {
                return true;
            }
        }

        return false;
    }

    public Aligner getAligner(int alignerNo) {
        return aligners.stream()
                .filter(aligner -> aligner.getSrNo() == alignerNo)
                .findFirst()
                .orElseThrow(() -> new AlignerNotFoundException(getId(), alignerNo));
    }

    public Aligner getAlignerIfPresent(int alignerNo) {
        Optional<Aligner> optionalAligner = aligners.stream()
                .filter(aligner -> aligner.getSrNo() == alignerNo)
                .findFirst();

        return optionalAligner.orElse(null);
    }

    public List<DailyAlignerWearTime> getDailyWearTimeRecords(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) return Collections.emptyList();

        List<DailyAlignerWearTime> records = new ArrayList<>();
        for (var a : aligners) {
            if (a.getEndDate() == null || a.getStartDate() == null) continue;

            if (a.getStartDate().isAfter(endDate) || a.getEndDate().isBefore(startDate)) {
                continue;
            }

            for (var r : a.getDailyWearTimeRecords()) {
                if (r.getDate().isBefore(startDate) || r.getDate().isAfter(endDate)) {
                    continue;
                }
                records.add(r);
            }
        }

        return records;
    }

    public Aligner getFirstAligner() {
        return aligners.stream().min(Comparator.comparing(Aligner::getSrNo)).orElse(null);
    }

    public Optional<DefaultAlignerReminder> getDefaultReminder(Long defaultReminderId) {
        return defaultAlignerReminders.stream()
                .filter(reminder -> reminder.getId().equals(defaultReminderId))
                .findFirst();
    }

    public Optional<CustomAlignerReminder> getCustomReminder(Long customReminderId) {
        return customReminders.stream()
                .filter(reminder -> reminder.getId().equals(customReminderId))
                .findFirst();
    }

    @Nullable
    public Integer daysRemainingOnCurrentAligner() {
        Aligner aligner = getCurrentAligner();
        if (aligner == null) return null;

        return aligner.dayRemaining();
    }

    @Nullable
    public Integer daysRemaining() {
        Aligner aligner = getCurrentAligner();
        if (aligner == null) return null;

        var currentAlignerEndDate = aligner.getEndDate();
        var lastAlignerEndDate = lastAlignerEndDate();
        if (currentAlignerEndDate == null || lastAlignerEndDate == null) return null;

        var today = LocalDate.now();

        if (aligner.getChangeDate() == null && today.isAfter(currentAlignerEndDate)) {
            return Math.toIntExact(ChronoUnit.DAYS.between(currentAlignerEndDate, lastAlignerEndDate) + 1);
        }

        return Math.toIntExact(ChronoUnit.DAYS.between(today, lastAlignerEndDate) + 1);
    }

    public Long totalTreatmentDays(boolean actualStartDate, boolean actualEndDate) {
        LocalDate startDate = actualStartDate ? actualStartDate() : firstAlignerStartDate();
        LocalDate endDate = actualEndDate ? actualEndDate() : lastAlignerEndDate();
        if (startDate == null || endDate == null) {
            return null;
        }

        return startDate.until(endDate, ChronoUnit.DAYS) + 1;
    }

    public void changeCurrentAligner(int newAlignerNo, LocalDate previousAlignerChangeDate) {
        var oldAligner = getCurrentAligner();
        if (oldAligner != null) {
            oldAligner.setChangeDate(previousAlignerChangeDate);
        }

        this.currentAlignerNo = newAlignerNo;
        this.progressStatus = ProgressStatus.IN_PROGRESS;

        changeStartDateOfAligner(newAlignerNo, previousAlignerChangeDate);
    }

    public void forceAlignerChange(
            int newAlignerNo, LocalDate previousAlignerChangeDate, LocalTime previousAlignerChangeTime) {
        var oldAligner = getCurrentAligner();
        if (oldAligner != null) {
            oldAligner.setChangeDate(previousAlignerChangeDate);
        }

        this.currentAlignerNo = newAlignerNo;
        this.progressStatus = ProgressStatus.IN_PROGRESS;

        updateAlignerDates(newAlignerNo, previousAlignerChangeDate, previousAlignerChangeTime);
    }

    private void updateAlignerDates(int newAlignerNo, LocalDate newStartDate, LocalTime previousAlignerChangeTime) {
        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        LocalDate startDate = newStartDate;
        LocalDate endDate;
        for (int i = newAlignerNo; i <= aligners.size(); i++) {
            var aligner = aligners.get(i - 1);
            aligner.setStartDate(startDate);

            endDate = startDate.plusDays(daysToWearEachAligner - 1);
            aligner.setEndDate(endDate);
            aligner.setTime(previousAlignerChangeTime);

            startDate = endDate;
        }
    }

    private void changeStartDateOfAligner(int srNo, LocalDate newStartDate) {
        LocalDate startDate;
        LocalDate endDate;

        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        startDate = newStartDate;
        LocalDate currentDate = LocalDate.now();

        for (int i = srNo; i <= aligners.size(); i++) {
            var aligner = aligners.get(i - 1);
            aligner.setStartDate(startDate);

            endDate = startDate.plusDays(daysToWearEachAligner - 1);
            aligner.setEndDate(endDate);

            if (aligner.getAlignerProduction() != null) {
                if (startDate.isAfter(currentDate)) {
                    aligner.getAlignerProduction().changeStatus(ProductionSubStatus.UNPROCESSED);
                } else {
                    aligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);
                }
            }

            startDate = endDate;
        }
    }

    public boolean shouldAskPatientForCurrentAlignerNo() {
        return creationStatus.equals(CreationStatus.DONE) && currentAlignerNo == null;
    }

    public boolean shouldAskPatientForTreatmentStartDate() {
        return creationStatus.equals(CreationStatus.DONE) && doctorTreatmentStartDate == null;
    }

    @Nullable
    public Long daysRemainingTillTreatmentCompletion() {
        var endDate = doctorTreatmentEndDate();
        if (endDate == null) return null;

        return ChronoUnit.DAYS.between(LocalDate.now(), endDate) + 1;
    }

    public void changeStartDate(@NotNull LocalDate newStartDate) {
        this.doctorTreatmentStartDate = newStartDate;
        if (creationStatus.equals(CreationStatus.DONE)
                && (newStartDate.isEqual(LocalDate.now()) || newStartDate.isBefore(LocalDate.now()))) {
            this.progressStatus = ProgressStatus.IN_PROGRESS;
        }

        changeStartDateOfAligner(startAlignerNo, newStartDate);
    }

    public void setCurrentAligner(int currentAlignerNo) {
        this.startAlignerNo = currentAlignerNo;
        this.aligners.forEach(aligner -> {
            var production = aligner.getAlignerProduction();
            if (aligner.getSrNo() < startAlignerNo) {
                production.changeStatus(ProductionSubStatus.UNTRACKED);
                production.setAlignerProductionLab(null);
            } else {
                production.changeStatus(ProductionSubStatus.UNPROCESSED);
            }
        });
    }

    public void moveToPreviousAligner(LocalDate previousAlignerNewEndDate) {
        if (currentAlignerNo == 1) {
            throw new IllegalArgumentException(
                    "Cannot move to previous aligner because current aligner is the first aligner");
        }

        this.currentAlignerNo = currentAlignerNo - 1;
        var currentAligner = getCurrentAligner();
        assert currentAligner != null;

        int newDaysToWear = (int) (currentAligner.getStartDate().until(previousAlignerNewEndDate, ChronoUnit.DAYS) + 1);
        currentAligner.setNoOfDaysToWear(newDaysToWear);

        changeStartDateOfAligner(currentAlignerNo, currentAligner.getStartDate(), newDaysToWear);
    }

    private void changeStartDateOfAligner(int srNo, LocalDate newStartDate, int currentAlignerDaysToWear) {
        LocalDate startDate = null;
        LocalDate endDate = newStartDate;

        aligners.sort(Comparator.comparing(Aligner::getSrNo));
        for (int i = srNo - 1; i >= 1; --i) {
            var aligner = aligners.get(i - 1);
            startDate = endDate.minusDays(daysToWearEachAligner - 1);

            aligner.setEndDate(endDate);
            aligner.setStartDate(startDate);
            aligner.setTime(LocalTime.now());

            endDate = startDate;
        }

        startDate = newStartDate;
        endDate = null;
        for (int i = srNo; i <= aligners.size(); i++) {
            var aligner = aligners.get(i - 1);
            aligner.setStartDate(startDate);

            if (i == srNo) {
                endDate = startDate.plusDays(currentAlignerDaysToWear - 1);
                aligner.setNoOfDaysToWear(currentAlignerDaysToWear);
            } else {
                endDate = startDate.plusDays(daysToWearEachAligner - 1);
                aligner.setNoOfDaysToWear(daysToWearEachAligner);
            }
            aligner.setEndDate(endDate);
            startDate = endDate;
        }
    }

    public List<AlignerChangeData> changeWearDatesOfAligner(
            int srNo, @NotNull LocalDate newStartDate, @NotNull LocalDate newEndDate) {
        LocalDate startDate;
        LocalDate endDate;
        List<AlignerChangeData> alignerChanges = new ArrayList<>();

        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        var currentAligner = aligners.get(srNo - 1);
        LocalDate oldEndDateForCurrent = currentAligner.getEndDate();

        currentAligner.setStartDate(newStartDate);
        currentAligner.setEndDate(newEndDate);

        alignerChanges.add(new AlignerChangeData(srNo, oldEndDateForCurrent, newEndDate));

        startDate = newEndDate;
        for (int i = srNo + 1; i <= aligners.size(); i++) {
            var aligner = aligners.get(i - 1);
            LocalDate oldEndDate = aligner.getEndDate();

            var daysToWearEachAligner = aligner.getStartDate().until(aligner.getEndDate(), ChronoUnit.DAYS) + 1;
            endDate = startDate.plusDays(daysToWearEachAligner - 1);

            aligner.setStartDate(startDate);
            aligner.setEndDate(endDate);

            if (!oldEndDate.equals(endDate)) {
                alignerChanges.add(new AlignerChangeData(aligner.getSrNo(), oldEndDate, endDate));
            }

            startDate = endDate;
        }

        return alignerChanges;
    }

    public List<AlignerChangeData> changeWearDatesOfAlignerForManual(
            int srNo, @NotNull LocalDate newStartDate, @NotNull LocalDate newEndDate) {
        LocalDate startDate = null;
        LocalDate endDate = newStartDate;
        List<AlignerChangeData> alignerChanges = new ArrayList<>();

        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        for (int i = srNo - 1; i >= 1; --i) {
            var aligner = aligners.get(i - 1);
            LocalDate oldEndDate = aligner.getEndDate();

            var daysToWearEachAligner = aligner.getStartDate().until(aligner.getEndDate(), ChronoUnit.DAYS) + 1;
            startDate = endDate.minusDays(daysToWearEachAligner - 1);

            aligner.setEndDate(endDate);
            aligner.setStartDate(startDate);
            aligner.setTime(LocalTime.now());

            if (!oldEndDate.equals(endDate)) {
                alignerChanges.add(new AlignerChangeData(aligner.getSrNo(), oldEndDate, endDate));
            }

            endDate = startDate;
        }

        var currentAligner = aligners.get(srNo - 1);
        LocalDate oldEndDateForCurrent = currentAligner.getEndDate();

        currentAligner.setStartDate(newStartDate);
        currentAligner.setEndDate(newEndDate);

        alignerChanges.add(new AlignerChangeData(srNo, oldEndDateForCurrent, newEndDate));

        startDate = newEndDate;
        endDate = null;
        for (int i = srNo + 1; i <= aligners.size(); i++) {
            var aligner = aligners.get(i - 1);
            LocalDate oldEndDate = aligner.getEndDate();

            var daysToWearEachAligner = aligner.getStartDate().until(aligner.getEndDate(), ChronoUnit.DAYS) + 1;
            endDate = startDate.plusDays(daysToWearEachAligner - 1);

            aligner.setStartDate(startDate);
            aligner.setEndDate(endDate);

            if (!oldEndDate.equals(endDate)) {
                alignerChanges.add(new AlignerChangeData(aligner.getSrNo(), oldEndDate, endDate));
            }

            startDate = endDate;
        }

        return alignerChanges;
    }

    public static int[] determineOverallRange(List<Integer> upperRange, List<Integer> lowerRange) {
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
