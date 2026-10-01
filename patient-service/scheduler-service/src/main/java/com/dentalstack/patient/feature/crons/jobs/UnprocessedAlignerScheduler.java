package com.dentalstack.patient.feature.crons.jobs;

import com.dentalstack.patient.feature.manufacturing.*;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.projections.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class UnprocessedAlignerScheduler {

    private final TreatmentPlanRepository treatmentPlanRepository;
    private final ManufacturingRepository manufacturingRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final ReminderRepository reminderRepository;
    private final NotificationService notificationService;

    /**
     * Scheduled job that runs every day at 10:20 AM
     * Fetches unprocessed aligners with due dates within the next 7 days
     */
    @Scheduled(cron = "0 20 10 * * ?") // Runs at 10:20 AM every day
    //    @Scheduled(cron = "* * * * * ?")
    @Transactional
    public void processUpcomingDueAligners() {
        log.info("Starting scheduled job for unprocessed aligners at {}", LocalDate.now());

        try {
            LocalDate today = LocalDate.now();
            LocalDate endDate = today.plusDays(7); // 7 days from today

            int page = 0;
            int batchSize = 100;
            boolean hasMoreData = true;
            int totalProcessed = 0;

            while (hasMoreData) {
                log.info("Processing batch {} of unprocessed aligners", page + 1);

                // Fetch all active treatment plans (no date filtering here)
                Page<TreatmentPlanSummary> activeTreatmentPlansPage =
                        treatmentPlanRepository.findAllActiveTreatmentPlans(PageRequest.of(page, batchSize));

                // Map and filter the current batch
                List<UnprocessedAlignerData> upcomingDueAligners = activeTreatmentPlansPage.stream()
                        .map(this::mapToUnprocessedAlignerData)
                        .filter(Objects::nonNull) // Filter out null entries (including those outside date range)
                        .collect(Collectors.toList());

                log.info(
                        "Found {} unprocessed aligners in batch {} (out of {} total in batch) with due dates between {} and {}",
                        upcomingDueAligners.size(),
                        page + 1,
                        activeTreatmentPlansPage.getNumberOfElements(),
                        today,
                        endDate);

                if (!upcomingDueAligners.isEmpty()) {
                    processAlignerNotifications(upcomingDueAligners);
                    totalProcessed += upcomingDueAligners.size();
                }

                // Check if we've reached the end of all pages
                hasMoreData = activeTreatmentPlansPage.hasNext();
                page++;

                // Optional: Add a small delay between batches to prevent database overload
                if (hasMoreData) {
                    try {
                        Thread.sleep(100); // 100ms delay between batches
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Batch processing interrupted");
                        break;
                    }
                }
            }

            log.info(
                    "Completed processing all batches. Total batches processed: {}, Total aligners processed: {}",
                    page,
                    totalProcessed);

        } catch (Exception e) {
            log.error("Error processing scheduled unprocessed aligners job", e);
        }
    }

    /**
     * Maps TreatmentPlanSummary to UnprocessedAlignerData with calculated due dates
     * Returns null if the aligner doesn't meet the date criteria (past due or beyond 7 days)
     */
    private UnprocessedAlignerData mapToUnprocessedAlignerData(TreatmentPlanSummary treatmentPlan) {
        try {
            AlignerInfo totalAligners = TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan);
            var treatmentPlanId = treatmentPlan.getId();

            List<ManufacturingBatchSummary> manufacturingBatches =
                    manufacturingRepository.findSummariesByTreatmentPlanId(treatmentPlanId);

            LocalDate dueBy = calculateDueByDate(treatmentPlan, manufacturingBatches);

            if (dueBy == null) {
                return null; // Skip if no due date
            }

            // Date range validation - return null to filter out
            LocalDate today = LocalDate.now();
            LocalDate endDate = today.plusDays(7);

            // Skip if due date is in the past
            if (dueBy.isBefore(today)) {
                log.debug("Skipping treatment plan {} - due date {} is in the past", treatmentPlanId, dueBy);
                return null;
            }

            // Skip if due date is more than 7 days in the future
            if (dueBy.isAfter(endDate)) {
                log.debug("Skipping treatment plan {} - due date {} is beyond 7 days window", treatmentPlanId, dueBy);
                return null;
            }

            AlignerInfo delivered = ManufacturingBatch.calculateDeliveredAlignersSummery(manufacturingBatches);
            AlignerInfo pending =
                    ManufacturingBatch.calculatePendingAlignersSummery(totalAligners, manufacturingBatches);

            return UnprocessedAlignerData.builder()
                    .treatmentPlanId(treatmentPlanId)
                    .patientId(treatmentPlan.getPatientId())
                    .patientFullName(treatmentPlan.getPatientFullName())
                    .customerName(treatmentPlan.getCustomerName())
                    .dueBy(dueBy)
                    .totalAligners(totalAligners)
                    .delivered(delivered)
                    .pending(pending)
                    .daysUntilDue(calculateDaysUntilDue(dueBy))
                    .userEmail(treatmentPlan.getUserEmail())
                    .orgName(treatmentPlan.getOrgName())
                    .build();

        } catch (Exception e) {
            log.error("Error mapping treatment plan {} to unprocessed aligner data", treatmentPlan.getId(), e);
            return null;
        }
    }

    /**
     * Calculates the due by date from manufacturing batches and aligner journey
     */
    private LocalDate calculateDueByDate(
            TreatmentPlanSummary treatmentPlan, List<ManufacturingBatchSummary> manufacturingBatches) {

        ManufacturingBatchSummary latestBatch = manufacturingBatches.stream()
                .max(Comparator.comparing(ManufacturingBatchSummary::getId))
                .orElse(null);

        if (latestBatch == null) {
            return null;
        }

        int remainingAlignerStartNumber = ManufacturingBatch.getRemainingAlignerStartNumberSummery(latestBatch);

        return alignerJourneyRepository
                .findAlignerEndDateByPatientIdAndSrNo(treatmentPlan.getPatientId(), remainingAlignerStartNumber)
                .orElse(null);
    }

    /**
     * Calculates days until due date
     */
    private int calculateDaysUntilDue(LocalDate dueBy) {
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), dueBy);
    }

    /**
     * Process notifications for the fetched aligners
     */
    private void processAlignerNotifications(List<UnprocessedAlignerData> aligners) {
        aligners.forEach(aligner -> {
            try {
                log.info(
                        "Processing notification for patient {} (Treatment Plan: {}), due in {} days",
                        aligner.getPatientFullName(),
                        aligner.getTreatmentPlanId(),
                        aligner.getDaysUntilDue());

                notificationService.notificationForUnprocessedAlignerDue(
                        aligner.getPatientId(),
                        aligner.getUserEmail(),
                        null,
                        aligner,
                        aligner.getPatientFullName(),
                        aligner.getOrgName());

            } catch (Exception e) {
                log.error("Error processing notification for treatment plan {}", aligner.getTreatmentPlanId(), e);
            }
        });
    }
}
