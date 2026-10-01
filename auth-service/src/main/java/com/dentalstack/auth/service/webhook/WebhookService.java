package com.dentalstack.auth.service.webhook;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.dto.webhook.SynapseWebhookPayload;

public interface WebhookService {
    void sendSynapseWebhook(SynapseWebhookPayload payload);

    AuthDetails testWebhook(String email);
}
