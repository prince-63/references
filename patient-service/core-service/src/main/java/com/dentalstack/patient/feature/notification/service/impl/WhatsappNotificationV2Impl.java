package com.dentalstack.patient.feature.notification.service.impl;

import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.WhatsappNotificationV2;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsappNotificationV2Impl implements WhatsappNotificationV2 {

    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final ChatService chatService;

    @Autowired
    @Lazy
    private SubscriptionService subscriptionService;

    @Override
    public void sendWhatsAppNotification(
            UserProfile from, UserProfile to, String templateName, List<String> templateParams) {

        if (to == null || to.getUser() == null) {
            return;
        }

        var orgWhatsAppDetails =
                subscriptionService.isWhatsAppMessagingEnabled(from.getDoctor().getId(), from.getId());

        String mobileNumber = to.getUser().getMobileNo();
        if (!StringUtils.hasText(mobileNumber)) {
            return;
        }

        whatsAppRequestBuilder
                .buildRequestIfMobileExists(
                        orgWhatsAppDetails.isWhatsAppMessagingEnabled(),
                        orgWhatsAppDetails.getOrgName(),
                        mobileNumber,
                        templateName,
                        templateParams)
                .ifPresent(chatService::sendWhatsAppMessage);
    }

    @Override
    public void sendWhatsAppNotification(UserProfile userProfile, String templateName, List<String> templateParams) {

        if (userProfile == null || userProfile.getUser() == null) {
            return;
        }

        var orgWhatsAppDetails = subscriptionService.isWhatsAppMessagingEnabled(
                userProfile.getDoctor().getId(), userProfile.getId());

        String mobileNumber = userProfile.getUser().getMobileNo();
        if (!StringUtils.hasText(mobileNumber)) {
            return;
        }

        whatsAppRequestBuilder
                .buildRequestIfMobileExists(
                        orgWhatsAppDetails.isWhatsAppMessagingEnabled(),
                        orgWhatsAppDetails.getOrgName(),
                        mobileNumber,
                        templateName,
                        templateParams)
                .ifPresent(chatService::sendWhatsAppMessage);
    }
}
