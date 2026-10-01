package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerPhotoRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.rewards.dto.request.CompleteTaskRequest;
import com.dentalstack.patient.feature.rewards.dto.request.CompletedTaskGetRequest;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.entity.CoinTransaction;
import com.dentalstack.patient.feature.rewards.entity.PatientTaskCompletion;
import com.dentalstack.patient.feature.rewards.entity.RewardTaskConfig;
import com.dentalstack.patient.feature.rewards.entity.UserWallet;
import com.dentalstack.patient.feature.rewards.enums.TaskCategory;
import com.dentalstack.patient.feature.rewards.enums.TaskCompletionStatus;
import com.dentalstack.patient.feature.rewards.enums.TaskType;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import com.dentalstack.patient.feature.rewards.repository.CoinTransactionRepository;
import com.dentalstack.patient.feature.rewards.repository.PatientTaskCompletionRepository;
import com.dentalstack.patient.feature.rewards.repository.RewardTaskConfigRepository;
import com.dentalstack.patient.feature.rewards.repository.UserWalletRepository;
import com.dentalstack.patient.feature.rewards.service.PatientTaskService;
import com.dentalstack.patient.global.exception.GenericException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientTaskServiceImpl implements PatientTaskService {

    private final PatientRepository patientRepository;
    private final RewardTaskConfigRepository taskConfigRepository;
    private final PatientTaskCompletionRepository taskCompletionRepository;
    private final UserWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;
    private final AlignerService alignerService;
    private final AlignerWearStatsHelper wearStatsHelper;
    private final AlignerPhotoRepository alignerPhotoRepository;
    private final AlignerActionRepository alignerActionRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;

    @Transactional(readOnly = true)
    @Override
    public PatientTaskListResponse getAvailableTasksByPatientId(Long patientId) {
        log.info("Fetching available tasks for patientId: {}", patientId);

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new GenericException("Patient not found"));

        Long userProfileId = patient.getDoctorOrganization().getUserProfile().getId();

        List<RewardTaskConfig> tasks =
                taskConfigRepository.findByUserProfileIdAndIsActiveTrueAndIsEnabledTrue(userProfileId);

        LocalDate today = LocalDate.now();
        Optional<AlignerJourney> alignerJourney =
                alignerJourneyRepository.findLatestAlignerJourneyByPatientId(patientId);

        AtomicReference<List<PatientTaskCompletion>> todayCompletions = new AtomicReference<>(new ArrayList<>());
        alignerJourney.ifPresent(a -> {
            todayCompletions.set(taskCompletionRepository.findByPatientIdAndCompletionDateAndAlignerNo(
                    patientId, today, a.getCurrentAlignerNo()));
        });

        List<Long> completedTaskIds = todayCompletions.get().stream()
                .map(completion -> completion.getRewardTaskConfig().getId())
                .toList();

        List<PatientTaskResponse> dailyTasks = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.DAILY)
                .map(task -> mapToPatientTaskResponse(task, completedTaskIds.contains(task.getId())))
                .toList();

        List<PatientTaskResponse> milestones = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.MILESTONE)
                .map(task -> mapToPatientTaskResponse(task, completedTaskIds.contains(task.getId())))
                .toList();

        List<PatientTaskResponse> wellnessChecks = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.DAILY_WELLNESS_CHECK)
                .map(task -> mapToPatientTaskResponse(task, completedTaskIds.contains(task.getId())))
                .toList();

        return PatientTaskListResponse.builder()
                .dailyTasks(dailyTasks)
                .milestones(milestones)
                .wellnessChecks(wellnessChecks)
                .totalCount(tasks.size())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public PatientTaskListResponse getAvailableTasks(Long patientId) {
        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new GenericException("Patient not found"));

        Long userProfileId = patient.getDoctorOrganization().getUserProfile().getId();

        List<RewardTaskConfig> tasks =
                taskConfigRepository.findByUserProfileIdAndIsActiveTrueAndIsEnabledTrue(userProfileId);

        LocalDate today = LocalDate.now();

        Optional<AlignerJourney> alignerJourney =
                alignerJourneyRepository.findLatestAlignerJourneyByPatientId(patientId);

        AtomicReference<List<PatientTaskCompletion>> todayCompletions = new AtomicReference<>(new ArrayList<>());
        alignerJourney.ifPresent(a -> {
            todayCompletions.set(taskCompletionRepository.findByPatientIdAndCompletionDateAndAlignerNo(
                    patientId, today, a.getCurrentAlignerNo()));
        });

        List<Long> completedTaskIds = todayCompletions.get().stream()
                .map(completion -> completion.getRewardTaskConfig().getId())
                .toList();

        Aligner currentAligner = null;
        AlignerWearStatsHelper.WearTimeStats wearStats7Day = null;
        AlignerWearStatsHelper.WearTimeStats wearStats15Day = null;
        Aligner previousAligner = null;

        try {
            currentAligner = alignerService.getCurrentAligner(patientId);
            if (currentAligner != null) {
                previousAligner = getPreviousAligner(currentAligner);
                wearStats7Day = wearStatsHelper.calculateWearTimeStats(currentAligner, 7);
                wearStats15Day = wearStatsHelper.calculateWearTimeStats(currentAligner, 15);
            }
        } catch (Exception e) {
            log.warn("Could not fetch aligner journey for patient {}: {}", patientId, e.getMessage());
        }

        final Aligner finalCurrentAligner = currentAligner;
        final AlignerWearStatsHelper.WearTimeStats finalWearStats7Day = wearStats7Day;

        List<PatientTaskResponse> dailyTasks = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.DAILY)
                .map(task -> mapDailyTask(task, completedTaskIds, finalWearStats7Day))
                .toList();

        final AlignerWearStatsHelper.WearTimeStats finalWearStats15Day = wearStats15Day;
        Aligner finalPreviousAligner = previousAligner;
        List<PatientTaskResponse> milestones = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.MILESTONE)
                .map(task -> mapMilestoneTask(
                        task,
                        completedTaskIds,
                        finalCurrentAligner,
                        finalWearStats7Day,
                        finalWearStats15Day,
                        patientId,
                        finalPreviousAligner))
                .toList();

        List<PatientTaskResponse> wellnessChecks = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.DAILY_WELLNESS_CHECK)
                .map(task -> mapWellnessCheck(task, completedTaskIds))
                .toList();

        return PatientTaskListResponse.builder()
                .dailyTasks(dailyTasks)
                .milestones(milestones)
                .wellnessChecks(wellnessChecks)
                .totalCount(tasks.size())
                .build();
    }

    @Nullable
    public Aligner getPreviousAligner(Aligner currentAligner) {
        if (currentAligner == null) {
            return null;
        }

        AlignerJourney journey = currentAligner.getAlignerJourney();
        int currentSrNo = currentAligner.getSrNo();

        if (currentSrNo <= journey.getStartAlignerNo()) {
            return null;
        }

        return journey.getAligners().stream()
                .filter(aligner -> aligner.getSrNo() == currentSrNo - 1)
                .findFirst()
                .orElse(null);
    }

    private PatientTaskResponse mapDailyTask(
            RewardTaskConfig task, List<Long> completedTaskIds, AlignerWearStatsHelper.WearTimeStats wearStats) {

        boolean isCompleted = completedTaskIds.contains(task.getId());

        if (task.getCategory() == TaskCategory.ALIGNER_WEAR
                && task.getTaskIdentifier().contains("22")) {

            if (wearStats == null) {
                return PatientTaskResponse.from(task, isCompleted, false);
            }

            boolean isClaimable = wearStatsHelper.isDailyWearTaskClaimable(wearStats, isCompleted);

            PatientTaskResponse.TaskProgress progress = PatientTaskResponse.TaskProgress.builder()
                    .todayWearTimeInHours(wearStats.getTodayWearTimeInHours())
                    .requiredHoursPerDay(22f)
                    .remainingDays(0)
                    .currentStreak(wearStats.getConsecutiveDaysCompleted())
                    .requiredStreak(1)
                    .message(buildDailyWearMessage(wearStats, isCompleted))
                    .build();

            return PatientTaskResponse.from(task, isCompleted, isClaimable, progress);
        }

        boolean isClaimable = !isCompleted;
        return PatientTaskResponse.from(task, isCompleted, isClaimable);
    }

    private PatientTaskResponse mapMilestoneTask(
            RewardTaskConfig task,
            List<Long> completedTaskIds,
            Aligner currentAligner,
            AlignerWearStatsHelper.WearTimeStats wearStats7Day,
            AlignerWearStatsHelper.WearTimeStats wearStats15Day,
            Long patientId,
            Aligner previousAligner) {

        boolean isCompleted = completedTaskIds.contains(task.getId());
        boolean isClaimable = false;
        PatientTaskResponse.TaskProgress progress = null;

        if (task.getCategory() == TaskCategory.PHOTO_UPLOAD) {
            isClaimable = isPhotoUploadTaskClaimable(patientId, task.getId(), currentAligner);
        } else if ("Move to Next Aligner".equals(task.getTaskIdentifier())) {
            isClaimable = isMoveToNextAlignerClaimable(patientId, task.getId(), previousAligner);
        } else if (task.getCategory() == TaskCategory.ALIGNER_WEAR && task.getStreakRequirement() > 0) {

            int requiredStreak = task.getStreakRequirement();
            AlignerWearStatsHelper.WearTimeStats relevantStats = (requiredStreak <= 7) ? wearStats7Day : wearStats15Day;

            if (relevantStats == null) {
                return PatientTaskResponse.from(task, isCompleted, false);
            }

            isClaimable = wearStatsHelper.isStreakMilestoneClaimable(relevantStats, requiredStreak, isCompleted);

            int remainingDays = Math.max(
                    0,
                    requiredStreak
                            - relevantStats.getConsecutiveDaysCompleted()
                            - (relevantStats.isTodayCompleted() ? 1 : 0));

            progress = PatientTaskResponse.TaskProgress.builder()
                    .currentStreak(
                            relevantStats.getConsecutiveDaysCompleted() + (relevantStats.isTodayCompleted() ? 1 : 0))
                    .requiredStreak(requiredStreak)
                    .remainingDays(remainingDays)
                    .todayWearTimeInHours(relevantStats.getTodayWearTimeInHours())
                    .requiredHoursPerDay(22f)
                    .message(buildStreakMessage(relevantStats, requiredStreak, isCompleted))
                    .build();
        } else {
            isClaimable = !isCompleted;
        }

        return PatientTaskResponse.from(task, isCompleted, isClaimable && !isCompleted, progress);
    }

    private PatientTaskResponse mapWellnessCheck(RewardTaskConfig task, List<Long> completedTaskIds) {

        boolean isCompleted = completedTaskIds.contains(task.getId());
        boolean isClaimable = !isCompleted;

        return PatientTaskResponse.from(task, isCompleted, isClaimable);
    }

    private String buildDailyWearMessage(AlignerWearStatsHelper.WearTimeStats stats, boolean isCompleted) {

        if (isCompleted) {
            return "Task completed for today!";
        }

        if (stats.isTodayCompleted()) {
            return String.format(
                    "Great! You've worn your aligner for %.1f hours today. Ready to claim!",
                    stats.getTodayWearTimeInHours());
        }

        return String.format(
                "Wear your aligner for %.1f more hours to complete this task", stats.getRemainingHoursToday());
    }

    private String buildStreakMessage(
            AlignerWearStatsHelper.WearTimeStats stats, int requiredStreak, boolean isCompleted) {

        if (isCompleted) {
            return "Milestone achieved!";
        }

        int currentStreak = stats.getConsecutiveDaysCompleted() + (stats.isTodayCompleted() ? 1 : 0);

        if (currentStreak >= requiredStreak) {
            return String.format("Amazing! You've completed %d days streak. Ready to claim!", currentStreak);
        }

        int remaining = requiredStreak - currentStreak;
        return String.format(
                "Keep going! %d more day%s to reach your %d-day streak goal",
                remaining, remaining > 1 ? "s" : "", requiredStreak);
    }

    private boolean isPhotoUploadTaskClaimable(Long patientId, Long taskConfigId, Aligner currentAligner) {
        if (currentAligner == null) {
            return false;
        }

        try {

            boolean hasPhotos = alignerPhotoRepository.existsByAlignerIdAndDeletedFalse(currentAligner.getId());

            if (!hasPhotos) {
                return false;
            }

            Optional<PatientTaskCompletion> lastCompletion =
                    taskCompletionRepository.findTopByPatientIdAndRewardTaskConfigIdOrderByCompletedAtDesc(
                            patientId, taskConfigId);

            if (lastCompletion.isPresent()) {
                String lastClaimedAlignerIdStr = lastCompletion.get().getAttachmentUrl();
                if (lastClaimedAlignerIdStr != null) {
                    try {
                        Long lastClaimedAlignerId = Long.parseLong(lastClaimedAlignerIdStr);

                        if (lastClaimedAlignerId.equals(currentAligner.getId())) {
                            return false;
                        }
                    } catch (NumberFormatException e) {
                        log.warn("Invalid aligner ID in attachment URL: {}", lastClaimedAlignerIdStr);
                    }
                }
            }

            return true;

        } catch (Exception e) {
            log.error("Error checking photo upload task claimability for patient {}: {}", patientId, e.getMessage());
            return false;
        }
    }

    private boolean isMoveToNextAlignerClaimable(Long patientId, Long taskConfigId, Aligner previousAligner) {
        if (previousAligner == null) {
            return false;
        }

        try {

            boolean hasAlignerChangeAction = alignerActionRepository.existsByAlignerIdAndTypeAndIsActiveTrue(
                    previousAligner.getId(), AlignerActionType.ALIGNER_CHANGE);

            if (!hasAlignerChangeAction) {

                return false;
            }

            Optional<PatientTaskCompletion> lastCompletion =
                    taskCompletionRepository.findTopByPatientIdAndRewardTaskConfigIdOrderByCompletedAtDesc(
                            patientId, taskConfigId);

            if (lastCompletion.isPresent()) {
                String lastClaimedAlignerIdStr = lastCompletion.get().getAttachmentUrl();
                if (lastClaimedAlignerIdStr != null) {
                    try {
                        Long lastClaimedAlignerId = Long.parseLong(lastClaimedAlignerIdStr);

                        if (lastClaimedAlignerId.equals(previousAligner.getId())) {
                            return false;
                        }
                    } catch (NumberFormatException e) {
                        log.warn("Invalid aligner ID in attachment URL: {}", lastClaimedAlignerIdStr);
                    }
                }
            }

            return true;

        } catch (Exception e) {
            log.error("Error checking move to next aligner claimability for patient {}: {}", patientId, e.getMessage());
            return false;
        }
    }

    @Transactional
    @Override
    public TaskCompletionResponse completeTask(CompleteTaskRequest request) {
        log.info("Patient {} completing task {}", request.getPatientId(), request.getTaskId());

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found"));

        RewardTaskConfig taskConfig = taskConfigRepository
                .findById(request.getTaskId())
                .orElseThrow(() -> new GenericException("Task not found"));

        Long patientUserProfileId =
                patient.getDoctorOrganization().getUserProfile().getId();
        if (!taskConfig.getUserProfile().getId().equals(patientUserProfileId)) {
            throw new GenericException("Task does not belong to your doctor");
        }

        if (!taskConfig.getIsEnabled()) {
            throw new GenericException("Task is currently disabled");
        }

        LocalDate today = LocalDate.now();
        Aligner currentAligner = null;
        String attachmentUrl = null;

        if (taskConfig.getTaskType() == TaskType.MILESTONE) {
            try {
                currentAligner = alignerService.getCurrentAligner(request.getPatientId());

                if (taskConfig.getCategory() == TaskCategory.PHOTO_UPLOAD
                        || "Move to Next Aligner".equals(taskConfig.getTaskIdentifier())) {

                    if (currentAligner == null) {
                        throw new GenericException("Current aligner not found");
                    }

                    boolean isClaimable;
                    if (taskConfig.getCategory() == TaskCategory.PHOTO_UPLOAD) {
                        isClaimable =
                                isPhotoUploadTaskClaimable(request.getPatientId(), request.getTaskId(), currentAligner);
                        if (!isClaimable) {
                            throw new GenericException("Photo upload task is not claimable. "
                                    + "Please ensure photos are uploaded for current aligner and not already claimed.");
                        }
                    } else {
                        isClaimable = isMoveToNextAlignerClaimable(
                                request.getPatientId(), request.getTaskId(), currentAligner);
                        if (!isClaimable) {
                            throw new GenericException("Move to next aligner task is not claimable. "
                                    + "Please ensure you have moved to a new aligner and not already claimed.");
                        }
                    }

                    attachmentUrl = String.valueOf(currentAligner.getId());
                } else if (taskConfig.getCategory() == TaskCategory.ALIGNER_WEAR
                        && taskConfig.getStreakRequirement() != null
                        && taskConfig.getStreakRequirement() > 0) {

                    if (currentAligner == null) {
                        throw new GenericException("Current aligner not found for streak validation");
                    }

                    boolean alreadyClaimed = taskCompletionRepository.existsByPatientIdAndRewardTaskConfigIdAndStatus(
                            request.getPatientId(), request.getTaskId(), TaskCompletionStatus.COMPLETED);

                    if (alreadyClaimed) {
                        throw new GenericException("Streak milestone already claimed");
                    }

                    int requiredStreak = taskConfig.getStreakRequirement();

                    AlignerWearStatsHelper.WearTimeStats wearStats = requiredStreak <= 7
                            ? wearStatsHelper.calculateWearTimeStats(currentAligner, 7)
                            : wearStatsHelper.calculateWearTimeStats(currentAligner, 15);

                    if (wearStats == null) {
                        throw new GenericException("Unable to calculate wear statistics");
                    }

                    boolean isClaimable = wearStatsHelper.isStreakMilestoneClaimable(wearStats, requiredStreak, false);

                    if (!isClaimable) {
                        int currentStreak =
                                wearStats.getConsecutiveDaysCompleted() + (wearStats.isTodayCompleted() ? 1 : 0);

                        throw new GenericException(String.format(
                                "Streak requirement not met. Current streak: %d days, Required: %d days",
                                currentStreak, requiredStreak));
                    }
                }

            } catch (GenericException e) {
                throw e;
            } catch (Exception e) {
                log.error(
                        "Error validating milestone task for patient {}: {}",
                        request.getPatientId(),
                        e.getMessage(),
                        e);
                throw new GenericException("Failed to validate milestone task: " + e.getMessage());
            }
        }

        Optional<AlignerJourney> alignerJourney =
                alignerJourneyRepository.findLatestAlignerJourneyByPatientId(request.getPatientId());

        if (taskConfig.getTaskType() == TaskType.DAILY || taskConfig.getTaskType() == TaskType.DAILY_WELLNESS_CHECK) {
            alignerJourney.ifPresent(a -> {
                boolean alreadyCompleted =
                        taskCompletionRepository.existsByPatientIdAndRewardTaskConfigIdAndCompletionDateAndAlignerNo(
                                request.getPatientId(), request.getTaskId(), today, a.getCurrentAlignerNo());

                if (alreadyCompleted) {
                    throw new GenericException("Task already completed today");
                }
            });
        }

        TaskCompletionStatus status = taskConfig.getRequiresVerification()
                ? TaskCompletionStatus.PENDING_VERIFICATION
                : TaskCompletionStatus.COMPLETED;

        PatientTaskCompletion completion = PatientTaskCompletion.builder()
                .patient(patient)
                .rewardTaskConfig(taskConfig)
                .completionDate(today)
                .completedAt(LocalDateTime.now())
                .status(status)
                .coinsEarned(taskConfig.getCoinReward())
                .notes(request.getNotes())
                .attachmentUrl(attachmentUrl)
                .build();
        alignerJourney.ifPresent(a -> {
            completion.setAlignerNo(a.getCurrentAlignerNo());
        });

        PatientTaskCompletion savedCompletion = taskCompletionRepository.save(completion);

        if (status == TaskCompletionStatus.COMPLETED) {
            creditCoinsToPatient(patient, taskConfig, savedCompletion);
        }

        String message = status == TaskCompletionStatus.PENDING_VERIFICATION
                ? "Task submitted for verification. Coins will be credited after approval."
                : "Task completed! " + taskConfig.getCoinReward() + " coins credited.";

        return TaskCompletionResponse.builder()
                .completionId(savedCompletion.getId())
                .taskName(taskConfig.getTaskName())
                .coinsEarned(taskConfig.getCoinReward())
                .status(status)
                .completedAt(savedCompletion.getCompletedAt())
                .message(message)
                .build();
    }

    private void creditCoinsToPatient(Patient patient, RewardTaskConfig taskConfig, PatientTaskCompletion completion) {
        log.info("Crediting {} coins to patient {}", taskConfig.getCoinReward(), patient.getId());

        UserWallet wallet = walletRepository
                .findByPatientId(patient.getId())
                .orElseThrow(() -> new GenericException("Wallet not found"));

        BigDecimal coinAmount = taskConfig.getCoinReward();
        BigDecimal balanceBefore = wallet.getTotalCoins();
        BigDecimal balanceAfter = balanceBefore.add(coinAmount);

        wallet.setTotalCoins(balanceAfter);
        wallet.setAvailableCoins(wallet.getAvailableCoins().add(coinAmount));
        wallet.setLifetimeEarned(wallet.getLifetimeEarned().add(coinAmount));

        if (taskConfig.getTaskType() == TaskType.DAILY) {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            boolean completedYesterday = taskCompletionRepository.existsByPatientIdAndCompletionDateAndStatus(
                    patient.getId(), yesterday, TaskCompletionStatus.COMPLETED);

            if (completedYesterday) {
                wallet.setCurrentStreak(wallet.getCurrentStreak() + 1);
            } else {
                wallet.setCurrentStreak(1);
            }

            if (wallet.getCurrentStreak() > wallet.getLongestStreak()) {
                wallet.setLongestStreak(wallet.getCurrentStreak());
            }
        }

        walletRepository.save(wallet);

        CoinTransaction transaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(taskConfig.getUserProfile())
                .transactionType(TransactionType.EARNED)
                .amount(coinAmount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .transactionDate(LocalDateTime.now())
                .referenceType("TASK")
                .referenceId(completion.getId())
                .description("Completed: " + taskConfig.getTaskName())
                .build();

        transactionRepository.save(transaction);

        log.info("Coins credited successfully. New balance: {}", balanceAfter);
    }

    @Transactional(readOnly = true)
    @Override
    public TaskCompletionListResponse getTaskHistory(Long patientId, String status, int page, int size) {
        log.info("Fetching task history for patientId: {}", patientId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "completedAt"));

        Page<PatientTaskCompletion> completionPage;

        if (status != null && !status.isEmpty()) {
            TaskCompletionStatus completionStatus = TaskCompletionStatus.valueOf(status);
            completionPage = taskCompletionRepository.findByPatientIdAndStatus(patientId, completionStatus, pageable);
        } else {
            completionPage = taskCompletionRepository.findByPatientId(patientId, pageable);
        }

        List<TaskCompletionHistoryItem> completions =
                completionPage.getContent().stream().map(this::mapToHistoryItem).collect(Collectors.toList());

        return TaskCompletionListResponse.builder()
                .completions(completions)
                .totalCount((int) completionPage.getTotalElements())
                .currentPage(page)
                .totalPages(completionPage.getTotalPages())
                .build();
    }

    private PatientTaskResponse mapToPatientTaskResponse(RewardTaskConfig task, boolean isCompletedToday) {
        return PatientTaskResponse.builder()
                .taskId(task.getId())
                .taskName(task.getTaskName())
                .taskDescription(task.getTaskDescription())
                .taskType(task.getTaskType())
                .category(task.getCategory())
                .coinReward(task.getCoinReward())
                .isCompleted(isCompletedToday)
                .build();
    }

    private TaskCompletionHistoryItem mapToHistoryItem(PatientTaskCompletion completion) {
        return TaskCompletionHistoryItem.builder()
                .id(completion.getId())
                .taskName(completion.getRewardTaskConfig().getTaskName())
                .coinsEarned(completion.getCoinsEarned())
                .status(completion.getStatus())
                .completedAt(completion.getCompletedAt())
                .attachmentUrl(completion.getAttachmentUrl())
                .alignerNo(completion.getAlignerNo())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public List<TaskCompletionHistoryItem> getCompletedTaskHistory(CompletedTaskGetRequest request) {

        List<PatientTaskCompletion> completions;
        var category = request.getCategory();
        var patientId = request.getPatientId();
        var startDate = request.getStartDate();
        var endDate = request.getEndDate();

        TaskCategory filterCategory = (category != null) ? category : TaskCategory.DAILY_WELLNESS_CHECK;

        if (startDate != null && endDate != null) {
            completions = taskCompletionRepository.findByPatientIdAndCategoryAndDateRange(
                    patientId, filterCategory, TaskCompletionStatus.COMPLETED, startDate, endDate);
        } else {
            completions = taskCompletionRepository.findByPatientIdAndCategoryAndStatus(
                    patientId, filterCategory, TaskCompletionStatus.COMPLETED);
        }

        if (filterCategory.equals(TaskCategory.DAILY_WELLNESS_CHECK)) {
            completions.sort(Comparator.comparing(
                    PatientTaskCompletion::getAlignerNo, Comparator.nullsLast(Integer::compareTo)));
        }

        return completions.stream().map(this::mapToHistoryItem).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<TaskCompletionHistoryItem> getWellnessCompletedTaskHistory(CompletedTaskGetRequest request) {
        List<PatientTaskCompletion> completions;
        var patientId = request.getPatientId();
        var alignerNo = request.getAlignerNo();
        completions = taskCompletionRepository.findByPatientIdAndCategoryAndStatusAndAlignerNo(
                patientId, TaskCategory.DAILY_WELLNESS_CHECK, TaskCompletionStatus.COMPLETED, alignerNo);
        return completions.stream().map(this::mapToHistoryItem).collect(Collectors.toList());
    }
}
