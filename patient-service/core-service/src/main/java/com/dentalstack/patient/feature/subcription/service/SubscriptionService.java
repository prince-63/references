package com.dentalstack.patient.feature.subcription.service;

import com.dentalstack.patient.feature.notification.dto.OrgWhatsAppDetails;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionAccountUpgradeRequestDTO;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionRequest;
import com.dentalstack.patient.feature.subcription.dto.UpgradeSubscription;
import java.util.List;

public interface SubscriptionService {
    SubscriptionPlanDTO getSubSubscriptionDetails(Long doctorId, Long userProfileId);

    boolean isSubscriptionActive(Long doctorId, Long userProfileId);

    void createCustomerAndSubscription(SubscriptionRequest request);

    SubscriptionPlanDTO extendCurrentSubscription(SubscriptionPlanDTO request) throws Exception;

    List<SubscriptionPlanDTO> getAllSubSubscriptionDetails(Long doctorId);

    void deactivateAccount(Long doctorId, String authCode);

    void requestForPlanUpgrade(SubscriptionAccountUpgradeRequestDTO subscriptionAccountUpgradeRequestDTO);

    String makeFalseUpgradeFlag(Long subscriptionId);

    void upgradeSubscription(UpgradeSubscription request);

    OrgWhatsAppDetails isWhatsAppMessagingEnabled(Long doctorId, Long userProfileId);

    void toggleIsDemoCompleted(Long profileId, Long doctorId);

    String getWhatsAppDetails(Long doctorId);
}
