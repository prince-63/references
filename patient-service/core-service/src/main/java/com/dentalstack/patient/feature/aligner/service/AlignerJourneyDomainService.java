package com.dentalstack.patient.feature.aligner.service;

import static com.dentalstack.patient.feature.aligner.util.AlignerJourneyUtils.getTreatmentCompletionPercentage;

import com.dentalstack.patient.feature.aligner.entity.*;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.CreationStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.*;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerChangeData;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import lombok.NonNull;
import org.springframework.stereotype.Service;

@Service
public class AlignerJourneyDomainService {

    public void validate(@NonNull AlignerJourney journey) {
        if (journey.getAligners() == null || journey.getAligners().isEmpty()) {
            throw new AlignersNotSetForAlignerJourneyException(journey.getId());
        }
        if (journey.getDoctorTreatmentStartDate() == null) {
            throw new DoctorTreatmentStartDateNotSetException(journey.getId());
        }
        if (journey.getCurrentAlignerNo() == null) {
            throw new CurrentAlignerNotSetException(journey.getId());
        }
        assertNotDeactivated(journey);
    }

    public void assertNotDeactivated(@NonNull AlignerJourney journey) {
        if (journey.getProgressStatus().equals(ProgressStatus.DEACTIVATED)) {
            throw new AlignerJourneyDeactivatedException(journey.getId());
        }
    }

    @Nullable
    public Aligner getCurrentAligner(@NonNull AlignerJourney journey) {
        if (journey.getCurrentAlignerNo() == null) return null;
        return journey.getAligners().stream()
                .filter(a -> a.getSrNo() == journey.getCurrentAlignerNo())
                .findFirst()
                .orElse(null);
    }

    public int totalAligners(@NonNull AlignerJourney journey) {
        return journey.getAligners().size();
    }

    public float avgWearTimeInSecs(@NonNull AlignerJourney journey) {
        List<Aligner> aligners = journey.getAligners();
        if (aligners.isEmpty()) return 0.0f;

        int totalCount = 0;
        float avgSum = 0.0f;
        for (var a : aligners) {
            if (a.getSrNo() < journey.getStartAlignerNo() || a.getSrNo() > journey.getCurrentAlignerNo()) continue;
            avgSum += Optional.ofNullable(a.avgWearTimeInSecs(true, true)).orElse(0.0f);
            totalCount += 1;
        }
        return totalCount > 0 ? avgSum / totalCount : 0.0f;
    }

    public long totalWearTimeInSecs(@NonNull AlignerJourney journey) {
        if (journey.getAligners().isEmpty()) return 0L;
        return journey.getAligners().stream().map(Aligner::totalWearTimeInSecs).reduce(0L, Long::sum);
    }

    public long totalRecommendedWearTimeInSecsTillNow(@NonNull AlignerJourney journey) {
        LocalDate startDate = getAligner(journey, 1).getStartDate();
        if (startDate == null) return 0L;
        long daysTillNow = ChronoUnit.DAYS.between(startDate, LocalDate.now()) + 1;
        return daysTillNow * journey.getRecommendedHoursToWearAligners() * 3600L;
    }

    @Nullable
    public Long numbersOfDaysAlignersWorn(
            @NonNull AlignerJourney journey, boolean actualStart, boolean actualEnd, boolean includeOngoing) {
        LocalDate startDate = actualStart ? actualStartDate(journey) : firstAlignerStartDate(journey);
        if (startDate == null) return null;

        return switch (journey.getProgressStatus()) {
            case NOT_STARTED -> 0L;
            case COMPLETE, DISCARDED, DEACTIVATED -> {
                LocalDate endDate = actualEnd ? actualEndDate(journey) : lastAlignerEndDate(journey);
                yield endDate == null ? null : startDate.until(endDate, ChronoUnit.DAYS) + 1;
            }
            case IN_PROGRESS -> {
                LocalDate today = LocalDate.now();
                LocalDate endDate = actualEnd ? actualEndDate(journey) : lastAlignerEndDate(journey);
                if (endDate == null) endDate = today;
                if (today.isAfter(endDate)) yield startDate.until(endDate, ChronoUnit.DAYS) + 1;
                else if (today.isBefore(startDate)) yield 0L;
                else yield startDate.until(today, ChronoUnit.DAYS) + (includeOngoing ? 1 : 0);
            }
        };
    }

    public float treatmentCompletionPercentage(
            @NonNull AlignerJourney journey, boolean actualStart, boolean actualEnd) {
        LocalDate startDate = actualStart ? actualStartDate(journey) : firstAlignerStartDate(journey);
        if (startDate == null) return 0.0F;

        return switch (journey.getProgressStatus()) {
            case NOT_STARTED -> 0.0F;
            case COMPLETE, DISCARDED, IN_PROGRESS, DEACTIVATED -> {
                LocalDate endDate = actualEnd ? actualEndDate(journey) : lastAlignerEndDate(journey);
                if (endDate == null) yield 0.0F;
                Aligner aligner = getCurrentAligner(journey);
                if (aligner == null) yield 0.0F;
                LocalDate currentAlignerEndDate = aligner.getEndDate();
                if (currentAlignerEndDate == null) yield 0.0F;
                LocalDate currentDate = LocalDate.now();
                if (aligner.getChangeDate() == null && currentDate.isAfter(currentAlignerEndDate)) {
                    currentDate = currentAlignerEndDate;
                }
                yield getTreatmentCompletionPercentage(startDate, endDate, currentDate);
            }
        };
    }

    public LocalDate actualStartDate(@NonNull AlignerJourney journey) {
        return journey.getPatientTreatmentStartDate() != null
                ? journey.getPatientTreatmentStartDate()
                : journey.getDoctorTreatmentStartDate();
    }

    @Nullable
    public LocalDate actualEndDate(@NonNull AlignerJourney journey) {
        return switch (journey.getProgressStatus()) {
            case IN_PROGRESS, NOT_STARTED -> null;
            case COMPLETE, DISCARDED, DEACTIVATED -> {
                if (journey.getPatientTreatmentEndDate() != null) yield journey.getPatientTreatmentEndDate();
                yield journey.getDoctorTreatmentEndDate();
            }
        };
    }

    public LocalDate firstAlignerStartDate(@NonNull AlignerJourney journey) {
        return getAligner(journey, 1).getStartDate();
    }

    public LocalDate lastAlignerEndDate(@NonNull AlignerJourney journey) {
        return getAligner(journey, totalAligners(journey)).getEndDate();
    }

    @Nullable
    public LocalDate doctorTreatmentEndDate(@NonNull AlignerJourney journey) {
        if (journey.getDoctorTreatmentEndDate() != null) return journey.getDoctorTreatmentEndDate();
        return lastAlignerEndDate(journey);
    }

    @Nullable
    public LocalDate patientTreatmentEndDate(@NonNull AlignerJourney journey) {
        if (journey.getPatientTreatmentEndDate() != null) return journey.getPatientTreatmentEndDate();
        return getAligner(journey, totalAligners(journey)).getChangeDate();
    }

    @Nullable
    public LocalDate nextAlignerChangeDate(@NonNull AlignerJourney journey) {
        Aligner current = getCurrentAligner(journey);
        return current == null ? null : current.getEndDate();
    }

    public boolean isAlignerCheckInToday(@NonNull AlignerJourney journey) {
        Aligner currentAligner = getCurrentAligner(journey);
        if (currentAligner == null) return false;

        int currentSrNo = currentAligner.getSrNo();
        ZonedDateTime today =
                ZonedDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        for (int srNo = 1; srNo <= currentSrNo; srNo++) {
            Aligner aligner = getAlignerOrNull(journey, srNo);
            if (aligner == null || aligner.getActions().isEmpty()) continue;

            List<AlignerAction> todayActions = aligner.getActions().stream()
                    .filter(action -> action.getPerformedAt()
                            .withHour(0)
                            .withMinute(0)
                            .withSecond(0)
                            .withNano(0)
                            .equals(today))
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
            if (lastActionWasCheckIn) return true;
        }
        return false;
    }

    public boolean isAlignerChangeToday(@NonNull AlignerJourney journey) {
        Aligner currentAligner = getCurrentAligner(journey);
        if (currentAligner == null) return false;

        int currentSrNo = currentAligner.getSrNo();
        ZonedDateTime today =
                ZonedDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        for (int srNo = 1; srNo <= currentSrNo; srNo++) {
            Aligner aligner = getAlignerOrNull(journey, srNo);
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
            if (hasChangeToday) return true;
        }
        return false;
    }

    public Aligner getAligner(@NonNull AlignerJourney journey, int alignerNo) {
        return journey.getAligners().stream()
                .filter(a -> a.getSrNo() == alignerNo)
                .findFirst()
                .orElseThrow(() -> new AlignerNotFoundException(journey.getId(), alignerNo));
    }

    @Nullable
    public Aligner getAlignerOrNull(@NonNull AlignerJourney journey, int alignerNo) {
        return journey.getAligners().stream()
                .filter(a -> a.getSrNo() == alignerNo)
                .findFirst()
                .orElse(null);
    }

    public Aligner getFirstAligner(@NonNull AlignerJourney journey) {
        return journey.getAligners().stream()
                .min(Comparator.comparing(Aligner::getSrNo))
                .orElse(null);
    }

    public List<DailyAlignerWearTime> getDailyWearTimeRecords(
            @NonNull AlignerJourney journey, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) return Collections.emptyList();

        List<DailyAlignerWearTime> records = new ArrayList<>();
        for (Aligner a : journey.getAligners()) {
            if (a.getEndDate() == null || a.getStartDate() == null) continue;
            if (a.getEndDate().isBefore(endDate) && a.getStartDate().isAfter(startDate)) continue;
            for (DailyAlignerWearTime r : a.getDailyWearTimeRecords()) {
                if (!r.getDate().isBefore(startDate) && !r.getDate().isAfter(endDate)) {
                    records.add(r);
                }
            }
        }
        return records;
    }

    public Optional<DefaultAlignerReminder> getDefaultReminder(
            @NonNull AlignerJourney journey, Long defaultReminderId) {
        return journey.getDefaultAlignerReminders().stream()
                .filter(r -> r.getId().equals(defaultReminderId))
                .findFirst();
    }

    public Optional<CustomAlignerReminder> getCustomReminder(@NonNull AlignerJourney journey, Long customReminderId) {
        return journey.getCustomReminders().stream()
                .filter(r -> r.getId().equals(customReminderId))
                .findFirst();
    }

    @Nullable
    public Integer daysRemainingOnCurrentAligner(@NonNull AlignerJourney journey) {
        Aligner aligner = getCurrentAligner(journey);
        return aligner == null ? null : aligner.dayRemaining();
    }

    @Nullable
    public Integer daysRemaining(@NonNull AlignerJourney journey) {
        Aligner aligner = getCurrentAligner(journey);
        if (aligner == null) return null;

        LocalDate currentAlignerEndDate = aligner.getEndDate();
        LocalDate lastEnd = lastAlignerEndDate(journey);
        if (currentAlignerEndDate == null || lastEnd == null) return null;

        LocalDate today = LocalDate.now();
        if (aligner.getChangeDate() == null && today.isAfter(currentAlignerEndDate)) {
            return Math.toIntExact(ChronoUnit.DAYS.between(currentAlignerEndDate, lastEnd) + 1);
        }
        return Math.toIntExact(ChronoUnit.DAYS.between(today, lastEnd) + 1);
    }

    @Nullable
    public Long totalTreatmentDays(@NonNull AlignerJourney journey, boolean actualStart, boolean actualEnd) {
        LocalDate startDate = actualStart ? actualStartDate(journey) : firstAlignerStartDate(journey);
        LocalDate endDate = actualEnd ? actualEndDate(journey) : lastAlignerEndDate(journey);
        if (startDate == null || endDate == null) return null;
        return startDate.until(endDate, ChronoUnit.DAYS) + 1;
    }

    @Nullable
    public Long daysRemainingTillTreatmentCompletion(@NonNull AlignerJourney journey) {
        LocalDate endDate = doctorTreatmentEndDate(journey);
        if (endDate == null) return null;
        return ChronoUnit.DAYS.between(LocalDate.now(), endDate) + 1;
    }

    public boolean shouldAskPatientForCurrentAlignerNo(@NonNull AlignerJourney journey) {
        return journey.getCreationStatus().equals(CreationStatus.DONE) && journey.getCurrentAlignerNo() == null;
    }

    public boolean shouldAskPatientForTreatmentStartDate(@NonNull AlignerJourney journey) {
        return journey.getCreationStatus().equals(CreationStatus.DONE) && journey.getDoctorTreatmentStartDate() == null;
    }

    public void changeCurrentAligner(
            @NonNull AlignerJourney journey, int newAlignerNo, LocalDate previousAlignerChangeDate) {
        Aligner oldAligner = getCurrentAligner(journey);
        if (oldAligner != null) {
            oldAligner.setChangeDate(previousAlignerChangeDate);
        }
        journey.setCurrentAlignerNo(newAlignerNo);
        journey.setProgressStatus(ProgressStatus.IN_PROGRESS);
        changeStartDateOfAligner(journey, newAlignerNo, previousAlignerChangeDate);
    }

    public void forceAlignerChange(
            @NonNull AlignerJourney journey,
            int newAlignerNo,
            LocalDate previousAlignerChangeDate,
            LocalTime previousAlignerChangeTime) {
        Aligner oldAligner = getCurrentAligner(journey);
        if (oldAligner != null) {
            oldAligner.setChangeDate(previousAlignerChangeDate);
        }
        journey.setCurrentAlignerNo(newAlignerNo);
        journey.setProgressStatus(ProgressStatus.IN_PROGRESS);
        updateAlignerDates(journey, newAlignerNo, previousAlignerChangeDate, previousAlignerChangeTime);
    }

    public void changeStartDate(@NonNull AlignerJourney journey, @NotNull LocalDate newStartDate) {
        journey.setDoctorTreatmentStartDate(newStartDate);
        if (journey.getCreationStatus().equals(CreationStatus.DONE)
                && (newStartDate.isEqual(LocalDate.now()) || newStartDate.isBefore(LocalDate.now()))) {
            journey.setProgressStatus(ProgressStatus.IN_PROGRESS);
        }
        changeStartDateOfAligner(journey, journey.getStartAlignerNo(), newStartDate);
    }

    public void setCurrentAligner(@NonNull AlignerJourney journey, int currentAlignerNo) {
        journey.setStartAlignerNo(currentAlignerNo);
        journey.getAligners().forEach(aligner -> {
            var production = aligner.getAlignerProduction();
            if (aligner.getSrNo() < currentAlignerNo) {
                production.changeStatus(ProductionSubStatus.UNTRACKED);
                production.setAlignerProductionLab(null);
            } else {
                production.changeStatus(ProductionSubStatus.UNPROCESSED);
            }
        });
    }

    public void moveToPreviousAligner(@NonNull AlignerJourney journey, LocalDate previousAlignerNewEndDate) {
        if (journey.getCurrentAlignerNo() == 1) {
            throw new IllegalArgumentException(
                    "Cannot move to previous aligner because current aligner is the first aligner");
        }

        journey.setCurrentAlignerNo(journey.getCurrentAlignerNo() - 1);
        Aligner currentAligner = getCurrentAligner(journey);
        assert currentAligner != null;

        int newDaysToWear = (int) (currentAligner.getStartDate().until(previousAlignerNewEndDate, ChronoUnit.DAYS) + 1);
        currentAligner.setNoOfDaysToWear(newDaysToWear);
        changeStartDateOfAlignerWithCustomDays(
                journey, journey.getCurrentAlignerNo(), currentAligner.getStartDate(), newDaysToWear);
    }

    public List<AlignerChangeData> changeWearDatesOfAligner(
            @NonNull AlignerJourney journey, int srNo, @NotNull LocalDate newStartDate, @NotNull LocalDate newEndDate) {
        List<Aligner> aligners = journey.getAligners();
        List<AlignerChangeData> changes = new ArrayList<>();
        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        Aligner currentAligner = aligners.get(srNo - 1);
        LocalDate oldEndDate = currentAligner.getEndDate();
        currentAligner.setStartDate(newStartDate);
        currentAligner.setEndDate(newEndDate);
        changes.add(new AlignerChangeData(srNo, oldEndDate, newEndDate));

        LocalDate startDate = newEndDate;
        for (int i = srNo + 1; i <= aligners.size(); i++) {
            Aligner aligner = aligners.get(i - 1);
            LocalDate prevEnd = aligner.getEndDate();
            long days = aligner.getStartDate().until(aligner.getEndDate(), ChronoUnit.DAYS) + 1;
            LocalDate endDate = startDate.plusDays(days - 1);
            aligner.setStartDate(startDate);
            aligner.setEndDate(endDate);
            if (!prevEnd.equals(endDate)) {
                changes.add(new AlignerChangeData(aligner.getSrNo(), prevEnd, endDate));
            }
            startDate = endDate;
        }
        return changes;
    }

    public List<AlignerChangeData> changeWearDatesOfAlignerForManual(
            @NonNull AlignerJourney journey, int srNo, @NotNull LocalDate newStartDate, @NotNull LocalDate newEndDate) {
        List<Aligner> aligners = journey.getAligners();
        List<AlignerChangeData> changes = new ArrayList<>();
        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        LocalDate endDate = newStartDate;
        for (int i = srNo - 1; i >= 1; --i) {
            Aligner aligner = aligners.get(i - 1);
            LocalDate prevEnd = aligner.getEndDate();
            long days = aligner.getStartDate().until(aligner.getEndDate(), ChronoUnit.DAYS) + 1;
            LocalDate start = endDate.minusDays(days - 1);
            aligner.setEndDate(endDate);
            aligner.setStartDate(start);
            aligner.setTime(LocalTime.now());
            if (!prevEnd.equals(endDate)) {
                changes.add(new AlignerChangeData(aligner.getSrNo(), prevEnd, endDate));
            }
            endDate = start;
        }

        Aligner currentAligner = aligners.get(srNo - 1);
        LocalDate oldEnd = currentAligner.getEndDate();
        currentAligner.setStartDate(newStartDate);
        currentAligner.setEndDate(newEndDate);
        changes.add(new AlignerChangeData(srNo, oldEnd, newEndDate));

        LocalDate startDate = newEndDate;
        for (int i = srNo + 1; i <= aligners.size(); i++) {
            Aligner aligner = aligners.get(i - 1);
            LocalDate prevEnd = aligner.getEndDate();
            long days = aligner.getStartDate().until(aligner.getEndDate(), ChronoUnit.DAYS) + 1;
            LocalDate end = startDate.plusDays(days - 1);
            aligner.setStartDate(startDate);
            aligner.setEndDate(end);
            if (!prevEnd.equals(end)) {
                changes.add(new AlignerChangeData(aligner.getSrNo(), prevEnd, end));
            }
            startDate = end;
        }
        return changes;
    }

    public static int[] determineOverallRange(List<Integer> upperRange, List<Integer> lowerRange) {
        final int[] lowestSrNo = {Integer.MAX_VALUE};
        final int[] highestSrNo = {Integer.MIN_VALUE};

        java.util.function.Consumer<List<Integer>> updateRange = range -> {
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

    private void updateAlignerDates(
            AlignerJourney journey, int newAlignerNo, LocalDate newStartDate, LocalTime previousAlignerChangeTime) {
        List<Aligner> aligners = journey.getAligners();
        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        LocalDate startDate = newStartDate;
        for (int i = newAlignerNo; i <= aligners.size(); i++) {
            Aligner aligner = aligners.get(i - 1);
            aligner.setStartDate(startDate);
            LocalDate endDate = startDate.plusDays(journey.getDaysToWearEachAligner() - 1);
            aligner.setEndDate(endDate);
            aligner.setTime(previousAlignerChangeTime);
            startDate = endDate;
        }
    }

    private void changeStartDateOfAligner(AlignerJourney journey, int srNo, LocalDate newStartDate) {
        List<Aligner> aligners = journey.getAligners();
        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        LocalDate startDate = newStartDate;
        LocalDate currentDate = LocalDate.now();

        for (int i = srNo; i <= aligners.size(); i++) {
            Aligner aligner = aligners.get(i - 1);
            aligner.setStartDate(startDate);
            LocalDate endDate = startDate.plusDays(journey.getDaysToWearEachAligner() - 1);
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

    private void changeStartDateOfAlignerWithCustomDays(
            AlignerJourney journey, int srNo, LocalDate newStartDate, int currentAlignerDaysToWear) {
        List<Aligner> aligners = journey.getAligners();
        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        LocalDate endDate = newStartDate;
        for (int i = srNo - 1; i >= 1; --i) {
            Aligner aligner = aligners.get(i - 1);
            LocalDate start = endDate.minusDays(journey.getDaysToWearEachAligner() - 1);
            aligner.setEndDate(endDate);
            aligner.setStartDate(start);
            aligner.setTime(LocalTime.now());
            endDate = start;
        }

        LocalDate startDate = newStartDate;
        for (int i = srNo; i <= aligners.size(); i++) {
            Aligner aligner = aligners.get(i - 1);
            aligner.setStartDate(startDate);
            if (i == srNo) {
                endDate = startDate.plusDays(currentAlignerDaysToWear - 1);
                aligner.setNoOfDaysToWear(currentAlignerDaysToWear);
            } else {
                endDate = startDate.plusDays(journey.getDaysToWearEachAligner() - 1);
                aligner.setNoOfDaysToWear(journey.getDaysToWearEachAligner());
            }
            aligner.setEndDate(endDate);
            startDate = endDate;
        }
    }
}
