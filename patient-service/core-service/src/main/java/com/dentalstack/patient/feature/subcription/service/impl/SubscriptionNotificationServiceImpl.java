package com.dentalstack.patient.feature.subcription.service.impl;

import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionEmailRequest;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionUserMapping;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.subcription.service.SubscriptionNotificationService;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionNotificationServiceImpl implements SubscriptionNotificationService {

    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;

    private static final int TRIAL_WARNING_DAYS = 7;
    private static final int SUBSCRIPTION_WARNING_DAYS = 7;

    private final ChatService chatService;
    private final UserProfileRepository userProfileRepository;

    private static final int BATCH_SIZE = 100;
    private static final int DEFAULT_PARALLEL_THREADS = 4;

    private final Set<String> processedNotificationsForToday = ConcurrentHashMap.newKeySet();

    private String generateNotificationKey(Long userProfileId, int daysUntilExpiry, boolean isTrial) {
        LocalDate today = LocalDate.now();
        return String.format("%d_%d_%b_%s", userProfileId, daysUntilExpiry, isTrial, today);
    }

    private boolean hasBeenProcessedToday(Long userProfileId, int daysUntilExpiry, boolean isTrial) {
        String notificationKey = generateNotificationKey(userProfileId, daysUntilExpiry, isTrial);
        return !processedNotificationsForToday.add(notificationKey);
    }

    private void processTrialNotifications(
            SubscriptionUserMapping subscription, SubscriptionPlanDTO.PlanMetadata metadata, ZonedDateTime now) {
        long daysUntilExpiry = ChronoUnit.DAYS.between(now, metadata.getCurrentTermEnd());
        var profileId = subscription.getUserProfileId();
        var userProfile = userProfileRepository.userProfileDetailsById(profileId);

        if (userProfile.isPresent() && !hasBeenProcessedToday(profileId, (int) daysUntilExpiry, true)) {
            if (daysUntilExpiry == TRIAL_WARNING_DAYS) {
                log.info(
                        "Sending email for plan expiring in 7 days: {}",
                        userProfile.get().getEmail());
                chatService.trialPlanExpiring(SubscriptionEmailRequest.builder()
                        .practiceDisplayName(userProfile.get().getFirstName())
                        .build());
            } else if (daysUntilExpiry == 0) {
                log.info(
                        "Sending email for trial plan expired: {}",
                        userProfile.get().getEmail());
                chatService.trialPlanExpired(SubscriptionEmailRequest.builder()
                        .practiceDisplayName(userProfile.get().getFirstName())
                        .build());
            }
        }
    }

    private void processPaidSubscriptionNotifications(
            SubscriptionUserMapping subscription, SubscriptionPlanDTO.PlanMetadata metadata, ZonedDateTime now) {
        long daysUntilExpiry = ChronoUnit.DAYS.between(now, metadata.getCurrentTermEnd());
        var profileId = subscription.getUserProfileId();
        var userProfile = userProfileRepository.userProfileDetailsById(profileId);

        if (userProfile.isPresent() && !hasBeenProcessedToday(profileId, (int) daysUntilExpiry, false)) {
            if (daysUntilExpiry == SUBSCRIPTION_WARNING_DAYS) {
                log.info(
                        "Sending email for plan expiring soon: {}",
                        userProfile.get().getFirstName());
                chatService.paidPlanRenewal(SubscriptionEmailRequest.builder()
                        .practiceDisplayName(userProfile.get().getFirstName())
                        .date(metadata.getCurrentTermEnd())
                        .email(userProfile.get().getEmail())
                        .build());
            } else if (daysUntilExpiry == 0) {
                log.info("Sending email for plan expired: {}", userProfile.get().getFirstName());
                chatService.subscriptionPlanExpired(SubscriptionEmailRequest.builder()
                        .practiceDisplayName(userProfile.get().getFirstName())
                        .email(userProfile.get().getEmail())
                        .orgName(userProfile.get().getOrgName())
                        .build());
            }
        }
    }

    @Override
    public void clearProcessedNotifications() {
        processedNotificationsForToday.clear();
        log.info("Cleared processed notifications tracker");
    }

    @Override
    @Transactional(readOnly = true)
    public void processSubscriptionNotifications() {
        log.info("Starting subscription notification process");

        int page = 0;
        List<SubscriptionUserMapping> batch;
        AtomicInteger processedCount = new AtomicInteger(0);

        do {
            Pageable pageable = PageRequest.of(page, BATCH_SIZE);
            Page<SubscriptionUserMapping> pageResult =
                    subscriptionUserMappingRepository.findDistinctByIsAdmin(true, pageable);

            batch = pageResult.getContent();
            if (!batch.isEmpty()) {
                processBatchParallel(batch);
                processedCount.addAndGet(batch.size());
                log.info(
                        "Processed batch {} with size {}, total processed: {}",
                        page,
                        batch.size(),
                        processedCount.get());
            }

            page++;
        } while (!batch.isEmpty());

        log.info("Completed subscription notification process. Total processed: {}", processedCount.get());
    }

    private void processBatchParallel(List<SubscriptionUserMapping> batch) {
        try (ForkJoinPool customThreadPool = new ForkJoinPool(DEFAULT_PARALLEL_THREADS)) {
            customThreadPool
                    .submit(() -> batch.parallelStream().forEach(this::processSubscriptionSafely))
                    .get();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error processing batch", e);
            Thread.currentThread().interrupt();
        }
    }

    private void processSubscriptionSafely(SubscriptionUserMapping subscription) {
        try {
            MDC.put("doctorId", String.valueOf(subscription.getDoctorId()));
            processSubscription(subscription);
        } catch (Exception e) {
            log.error("Error processing subscription notification for doctorId: {}", subscription.getDoctorId(), e);
        } finally {
            MDC.remove("doctorId");
        }
    }

    private void processSubscription(SubscriptionUserMapping subscription) {
        SubscriptionPlan plan = subscription.getSubscriptionPlan();
        SubscriptionPlanDTO.PlanMetadata metadata = plan.getPlanMetadata();
        ZonedDateTime now = ZonedDateTime.now();

        if (metadata.getStatus() != SubscriptionPlanDTO.PlanStatus.ACTIVE) {
            return;
        }

        if (isTrialPlan(metadata)) {
            processTrialNotifications(subscription, metadata, now);
        } else {
            processPaidSubscriptionNotifications(subscription, metadata, now);
        }
    }

    private boolean isTrialPlan(SubscriptionPlanDTO.PlanMetadata metadata) {
        return metadata.isTrialPlan() || metadata.getPlanType() == SubscriptionPlanDTO.PlanType.TRIAL;
    }
}
