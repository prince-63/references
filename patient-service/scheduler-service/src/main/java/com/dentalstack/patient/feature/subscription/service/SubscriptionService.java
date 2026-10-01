package com.dentalstack.patient.feature.subscription.service;

import com.dentalstack.patient.feature.whatsapp.dto.OrgWhatsAppDetails;

public interface SubscriptionService {

    OrgWhatsAppDetails isWhatsAppMessagingEnabled(Long doctorId, Long userProfileId);
}
