package com.dentalstack.patient.feature.notification.service.impl;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.notification.service.SlackService;
import com.dentalstack.patient.feature.storage.migration.dto.MigrationStatus;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionAccountUpgradeRequestDTO;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.projection.UserProfileSummary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("stage | dev")
public class MockSlackServiceImpl implements SlackService {

    @Override
    public void sendPlanUpgradeRequestMessage(
            UserProfileSummary userProfile, SubscriptionAccountUpgradeRequestDTO request, String formattedPlanName) {}

    @Override
    public void sendSubscriptionUpdateMessage(
            UserProfileSummary userProfileSummary, SubscriptionPlanDTO request, SubscriptionPlan subscriptionPlan) {}

    @Override
    public void sendSlackNotification(
            Doctor doctor, String planName, String userType, String roleName, UserProfile userProfile) {}

    @Override
    public void sendMigrationCompletionMessage(
            UserProfileSummary userProfileSummary, MigrationStatus migrationStatus, double progress) {}
}
