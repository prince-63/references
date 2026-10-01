package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanningNotificationService {

    private final WhatsAppUtilities whatsAppUtilities;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final ChatService chatService;

    public void notifySafely(String actionName, Runnable action) {
        try {
            action.run();
        } catch (Exception exception) {
            log.error("VSP notification failure: {}", actionName, exception);
        }
    }

    public void sendWhatsAppSafely(
            UserProfile profile, String mobileNo, String templateName, List<String> templateValues) {
        notifySafely("whatsapp-" + templateName, () -> {
            UserProfile ownerProfile = resolveOwnerProfile(profile);
            if (ownerProfile == null) {
                log.warn("Skip VSP WhatsApp. owner profile is null for template={}", templateName);
                return;
            }

            OrgName orgName = whatsAppUtilities.resolveOrgName(ownerProfile.getId());
            boolean enabled = whatsAppUtilities.isWhatsAppEnabled(ownerProfile.getId());
            if (enabled) {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(true, orgName, mobileNo, templateName, templateValues)
                        .ifPresent(chatService::sendWhatsAppMessage);
            }
        });
    }

    private UserProfile resolveOwnerProfile(UserProfile profile) {
        if (profile == null) {
            return null;
        }
        if (profile.isOwner() || profile.getInviterProfile() == null) {
            return profile;
        }
        return profile.getInviterProfile();
    }
}
