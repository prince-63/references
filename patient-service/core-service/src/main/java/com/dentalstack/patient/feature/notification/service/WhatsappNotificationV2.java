package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import java.util.List;

public interface WhatsappNotificationV2 {

    void sendWhatsAppNotification(UserProfile from, UserProfile to, String templateName, List<String> templateParams);

    void sendWhatsAppNotification(UserProfile userProfile, String templateName, List<String> templateParams);
}
