package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.storage.migration.dto.MigrationStatus;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionAccountUpgradeRequestDTO;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.projection.UserProfileSummary;

public interface SlackService {
    void sendPlanUpgradeRequestMessage(
            UserProfileSummary userProfile, SubscriptionAccountUpgradeRequestDTO request, String formattedPlanName);

    void sendSubscriptionUpdateMessage(
            UserProfileSummary userProfileSummary, SubscriptionPlanDTO request, SubscriptionPlan subscriptionPlan);

    void sendSlackNotification(
            Doctor doctor, String planName, String userType, String roleName, UserProfile userProfile);

    void sendMigrationCompletionMessage(
            UserProfileSummary userProfileSummary, MigrationStatus migrationStatus, double progress);
}
