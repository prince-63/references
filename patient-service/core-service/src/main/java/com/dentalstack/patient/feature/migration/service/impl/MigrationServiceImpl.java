package com.dentalstack.patient.feature.migration.service.impl;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.repository.AlignerProductionQueryRepository;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.migration.service.MigrationService;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.entity.Role;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MigrationServiceImpl implements MigrationService {

    private final AlignerProductionQueryRepository alignerProductionQueryRepository;
    private final ManufacturingRepository manufacturingBatchRepository;
    private final PatientRepository patientRepository;

    private static final int BATCH_SIZE = 50;
    private static final int MAX_RETRIES = 3;

    @Override
    @Transactional
    public void migrateAlignerJourneyToManufacturingBatches(Long id) {
        log.info("Starting migration of aligner journey data to manufacturing batches");

        int page = 0;
        int totalProcessed = 0;
        int totalSkipped = 0;
        int totalErrors = 0;

        while (true) {
            Pageable pageable = PageRequest.of(page, BATCH_SIZE);
            Page<AlignerJourney> journeyPage = getEligibleJourneysPage(pageable);

            if (journeyPage.isEmpty()) {
                log.info("No more eligible journeys found. Migration completed.");
                break;
            }

            List<AlignerJourney> eligibleJourneys = journeyPage.getContent();
            log.info(
                    "Processing batch {} of {} journeys (page {}/{})",
                    eligibleJourneys.size(),
                    journeyPage.getTotalElements(),
                    page + 1,
                    journeyPage.getTotalPages());

            BatchResult result = processBatch(eligibleJourneys);

            totalProcessed += result.processed();
            totalSkipped += result.skipped();
            totalErrors += result.errors();

            log.info(
                    "Batch completed: {} processed, {} skipped, {} errors",
                    result.processed(),
                    result.skipped(),
                    result.errors());

            page++;
        }

        log.info(
                "Migration completed: {} total journeys processed, {} skipped, {} errors",
                totalProcessed,
                totalSkipped,
                totalErrors);
    }

    private Page<AlignerJourney> getEligibleJourneysPage(Pageable pageable) {
        try {
            return alignerProductionQueryRepository.findEligibleJourneysWithoutManufacturingBatches(
                    ProgressStatus.IN_PROGRESS.name(), pageable);
        } catch (Exception e) {
            log.error("Error fetching eligible journeys for page {}: {}", pageable.getPageNumber(), e.getMessage());
            return Page.empty();
        }
    }

    @Transactional
    public BatchResult processBatch(List<AlignerJourney> journeys) {
        int processed = 0;
        int skipped = 0;
        int errors = 0;

        for (AlignerJourney journey : journeys) {
            try {
                ProcessResult result = processAlignerJourneyWithRetry(journey);
                switch (result) {
                    case SUCCESS:
                        processed++;
                        break;
                    case SKIPPED:
                        skipped++;
                        break;
                    case ERROR:
                        errors++;
                        break;
                }
            } catch (Exception e) {
                log.error("Unexpected error processing aligner journey with ID: {}", journey.getId(), e);
                errors++;
            }
        }

        return new BatchResult(processed, skipped, errors);
    }

    private ProcessResult processAlignerJourneyWithRetry(AlignerJourney journey) {
        int attempts = 0;

        while (attempts < MAX_RETRIES) {
            try {
                boolean success = processAlignerJourney(journey);
                return success ? ProcessResult.SUCCESS : ProcessResult.SKIPPED;
            } catch (Exception e) {
                attempts++;
                log.warn("Attempt {} failed for aligner journey ID {}: {}", attempts, journey.getId(), e.getMessage());

                if (attempts >= MAX_RETRIES) {
                    log.error("Max retries exceeded for aligner journey ID: {}", journey.getId(), e);
                    return ProcessResult.ERROR;
                }

                try {
                    Thread.sleep(50L * attempts);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return ProcessResult.ERROR;
                }
            }
        }

        return ProcessResult.ERROR;
    }

    private boolean processAlignerJourney(AlignerJourney journey) {
        try {
            var treatmentPlan = journey.getTracking().getTreatmentPlan();

            List<ManufacturingBatch> existingBatches =
                    manufacturingBatchRepository.findByTreatmentPlanId(treatmentPlan.getId());

            if (!existingBatches.isEmpty()) {
                log.debug("Manufacturing batches already exist for treatment plan ID: {}", treatmentPlan.getId());
                return false;
            }

            AlignerDetailsMetadata alignerMetadata = treatmentPlan.getAlignerDetailsMetadata();
            if (alignerMetadata == null) {
                log.debug("No aligner metadata found for treatment plan ID: {}", treatmentPlan.getId());
                return false;
            }

            Integer lowestAlignerNumber = getLowestAlignerNumber(alignerMetadata);
            if (lowestAlignerNumber == null) {
                log.debug("Could not determine lowest aligner number for treatment plan ID: {}", treatmentPlan.getId());
                return false;
            }

            Integer currentAlignerNumber = journey.getCurrentAlignerNo();
            if (currentAlignerNumber == null || currentAlignerNumber < 0) {
                log.debug("Invalid current aligner number for journey ID: {}", journey.getId());
                return false;
            }

            ManufacturingBatch deliveredBatch =
                    createDeliveredManufacturingBatch(treatmentPlan, lowestAlignerNumber, currentAlignerNumber);

            if (deliveredBatch == null) {
                log.debug("Could not create manufacturing batch for treatment plan ID: {}", treatmentPlan.getId());
                return false;
            }

            manufacturingBatchRepository.save(deliveredBatch);
            log.debug("Successfully created manufacturing batch for treatment plan ID: {}", treatmentPlan.getId());
            return true;

        } catch (Exception e) {
            log.error("Error processing aligner journey ID: {}", journey.getId(), e);
            throw e;
        }
    }

    private Integer getLowestAlignerNumber(AlignerDetailsMetadata alignerMetadata) {
        try {
            Integer lowestUpper = null;
            Integer lowestLower = null;

            if (alignerMetadata.getUpperJawDetails() != null) {
                UpperJawDetails upperJaw = alignerMetadata.getUpperJawDetails();
                if (upperJaw.getStartsWith() != null) {
                    lowestUpper = upperJaw.getStartsWith();
                } else if (upperJaw.getRange() != null && !upperJaw.getRange().isEmpty()) {
                    lowestUpper =
                            upperJaw.getRange().stream().min(Integer::compare).orElse(null);
                }
            }

            if (alignerMetadata.getLowerJawDetails() != null) {
                LowerJawDetails lowerJaw = alignerMetadata.getLowerJawDetails();
                if (lowerJaw.getStartsWith() != null) {
                    lowestLower = lowerJaw.getStartsWith();
                } else if (lowerJaw.getRange() != null && !lowerJaw.getRange().isEmpty()) {
                    lowestLower =
                            lowerJaw.getRange().stream().min(Integer::compare).orElse(null);
                }
            }

            if (lowestUpper != null && lowestLower != null) {
                return Math.min(lowestUpper, lowestLower);
            } else if (lowestUpper != null) {
                return lowestUpper;
            } else {
                return lowestLower;
            }
        } catch (Exception e) {
            log.error("Error calculating lowest aligner number", e);
            return null;
        }
    }

    private ManufacturingBatch createDeliveredManufacturingBatch(
            TreatmentPlan treatmentPlan, Integer startAlignerNumber, Integer endAlignerNumber) {

        try {
            Long patientId = treatmentPlan.getPatient().getId();

            var patientOptional = patientRepository.findByIdWithDoctorProfileDetails(patientId);
            if (patientOptional.isEmpty()) {
                log.debug("Patient not found for ID: {}", patientId);
                return null;
            }

            var patient = patientOptional.get();
            if (patient.getDoctorOrganization() == null
                    || patient.getDoctorOrganization().getUserProfile() == null) {
                log.debug("No doctor organization or user profile found for patient ID: {}", patientId);
                return null;
            }

            Set<String> userRoles = patientOptional.get().getDoctorOrganization().getUserProfile().getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet());

            Set<String> PRACTICE_ROLE = Set.of("CONSULTING_ORTHODONTIST");

            boolean isPracticeRole = userRoles.stream().anyMatch(PRACTICE_ROLE::contains);
            if (!isPracticeRole) {
                log.debug("User does not have practice role for patient ID: {}", patientId);
                return null;
            }

            AlignerDetailsMetadata alignerMetadata = treatmentPlan.getAlignerDetailsMetadata();
            var userProfile = patient.getDoctorOrganization().getUserProfile();
            var inviterProfile = userProfile.getInviterProfile();

            if (inviterProfile == null || userProfile.getProfileType() != ProfileType.INVITED) {
                log.debug("No inviter profile found for patient ID: {}", patientId);
                return null;
            }

            Integer upperStart = null, upperEnd = null;
            Integer lowerStart = null, lowerEnd = null;

            if (alignerMetadata.getUpperJawDetails() != null) {
                UpperJawDetails upperJaw = alignerMetadata.getUpperJawDetails();
                if (isInRange(startAlignerNumber, endAlignerNumber, upperJaw)) {
                    Integer effectiveUpperStart = getEffectiveStart(upperJaw);
                    Integer effectiveUpperEnd = getEffectiveEnd(upperJaw);
                    if (effectiveUpperStart != null) {
                        upperStart = Math.max(startAlignerNumber, effectiveUpperStart);
                    }
                    if (effectiveUpperEnd != null) {
                        upperEnd = Math.min(endAlignerNumber, effectiveUpperEnd);
                    }
                }
            }

            if (alignerMetadata.getLowerJawDetails() != null) {
                LowerJawDetails lowerJaw = alignerMetadata.getLowerJawDetails();
                if (isInRange(startAlignerNumber, endAlignerNumber, lowerJaw)) {
                    Integer effectiveLowerStart = getEffectiveStart(lowerJaw);
                    Integer effectiveLowerEnd = getEffectiveEnd(lowerJaw);
                    if (effectiveLowerStart != null) {
                        lowerStart = Math.max(startAlignerNumber, effectiveLowerStart);
                    }
                    if (effectiveLowerEnd != null) {
                        lowerEnd = Math.min(endAlignerNumber, effectiveLowerEnd);
                    }
                }
            }

            Integer totalAligners = calculateTotalAligners(upperStart, upperEnd, lowerStart, lowerEnd);

            return ManufacturingBatch.builder()
                    .order(treatmentPlan.getOrder())
                    .treatmentPlan(treatmentPlan)
                    .patient(treatmentPlan.getPatient())
                    .batchType(BatchType.IN_BATCHES)
                    .manufacturingOwnerProfile(inviterProfile)
                    .manufacturingTargetProfile(userProfile)
                    .status(ManufacturingStatus.DELIVERED)
                    .upperAlignerStart(upperStart)
                    .upperAlignerEnd(upperEnd)
                    .lowerAlignerStart(lowerStart)
                    .lowerAlignerEnd(lowerEnd)
                    .totalAligners(totalAligners)
                    .startDate(null)
                    .completionDate(null)
                    .shippingDate(null)
                    .deliveryDate(null)
                    .alreadyDelivered(true)
                    .isCurrent(true)
                    .build();

        } catch (Exception e) {
            log.error("Error creating manufacturing batch for treatment plan ID: {}", treatmentPlan.getId(), e);
            return null;
        }
    }

    private boolean isInRange(Integer startAligner, Integer endAligner, UpperJawDetails upperJaw) {
        try {
            if (upperJaw.getStartsWith() != null && upperJaw.getEndsWith() != null) {
                return !(endAligner < upperJaw.getStartsWith() || startAligner > upperJaw.getEndsWith());
            } else if (upperJaw.getRange() != null && !upperJaw.getRange().isEmpty()) {
                Integer minRange =
                        upperJaw.getRange().stream().min(Integer::compare).orElse(null);
                Integer maxRange =
                        upperJaw.getRange().stream().max(Integer::compare).orElse(null);
                return !(endAligner < minRange || startAligner > maxRange);
            }
            return false;
        } catch (Exception e) {
            log.error("Error checking range for upper jaw", e);
            return false;
        }
    }

    private boolean isInRange(Integer startAligner, Integer endAligner, LowerJawDetails lowerJaw) {
        try {
            if (lowerJaw.getStartsWith() != null && lowerJaw.getEndsWith() != null) {
                return !(endAligner < lowerJaw.getStartsWith() || startAligner > lowerJaw.getEndsWith());
            } else if (lowerJaw.getRange() != null && !lowerJaw.getRange().isEmpty()) {
                Integer minRange =
                        lowerJaw.getRange().stream().min(Integer::compare).orElse(null);
                Integer maxRange =
                        lowerJaw.getRange().stream().max(Integer::compare).orElse(null);
                return !(endAligner < minRange || startAligner > maxRange);
            }
            return false;
        } catch (Exception e) {
            log.error("Error checking range for lower jaw", e);
            return false;
        }
    }

    private Integer getEffectiveStart(UpperJawDetails upperJaw) {
        try {
            if (upperJaw.getStartsWith() != null) {
                return upperJaw.getStartsWith();
            } else if (upperJaw.getRange() != null && !upperJaw.getRange().isEmpty()) {
                return upperJaw.getRange().stream().min(Integer::compare).orElse(null);
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting effective start for upper jaw", e);
            return null;
        }
    }

    private Integer getEffectiveEnd(UpperJawDetails upperJaw) {
        try {
            if (upperJaw.getEndsWith() != null) {
                return upperJaw.getEndsWith();
            } else if (upperJaw.getRange() != null && !upperJaw.getRange().isEmpty()) {
                return upperJaw.getRange().stream().max(Integer::compare).orElse(null);
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting effective end for upper jaw", e);
            return null;
        }
    }

    private Integer getEffectiveStart(LowerJawDetails lowerJaw) {
        try {
            if (lowerJaw.getStartsWith() != null) {
                return lowerJaw.getStartsWith();
            } else if (lowerJaw.getRange() != null && !lowerJaw.getRange().isEmpty()) {
                return lowerJaw.getRange().stream().min(Integer::compare).orElse(null);
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting effective start for lower jaw", e);
            return null;
        }
    }

    private Integer getEffectiveEnd(LowerJawDetails lowerJaw) {
        try {
            if (lowerJaw.getEndsWith() != null) {
                return lowerJaw.getEndsWith();
            } else if (lowerJaw.getRange() != null && !lowerJaw.getRange().isEmpty()) {
                return lowerJaw.getRange().stream().max(Integer::compare).orElse(null);
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting effective end for lower jaw", e);
            return null;
        }
    }

    private Integer calculateTotalAligners(Integer upperStart, Integer upperEnd, Integer lowerStart, Integer lowerEnd) {
        try {
            int total = 0;

            if (upperStart != null && upperEnd != null && upperStart <= upperEnd) {
                total += (upperEnd - upperStart + 1);
            }

            if (lowerStart != null && lowerEnd != null && lowerStart <= lowerEnd) {
                total += (lowerEnd - lowerStart + 1);
            }

            return total;
        } catch (Exception e) {
            log.error("Error calculating total aligners", e);
            return 0;
        }
    }

    private record BatchResult(int processed, int skipped, int errors) {}

    private enum ProcessResult {
        SUCCESS,
        SKIPPED,
        ERROR
    }
}
