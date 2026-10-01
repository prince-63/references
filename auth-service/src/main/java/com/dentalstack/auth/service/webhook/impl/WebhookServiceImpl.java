package com.dentalstack.auth.service.webhook.impl;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.dto.webhook.SynapseWebhookPayload;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.doctor.UserNotSignedUpException;
import com.dentalstack.auth.repository.AuthRepository;
import com.dentalstack.auth.service.DoctorService;
import com.dentalstack.auth.service.webhook.WebhookService;
import com.dentalstack.auth.util.UrlUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookServiceImpl implements WebhookService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${webhook.synapse.url}")
    private String synapseWebhookUrl;

    @Value("${webhook.synapse.secret:}")
    private String synapseWebhookSecret;

    private final AuthRepository authRepository;
    private final UrlUtil urlUtil;

    private final DoctorService doctorService;

    @Override
    public void sendSynapseWebhook(SynapseWebhookPayload payload) {
        try {
            HttpHeaders headers = getHttpHeaders(payload);

            String jsonPayload = objectMapper.writeValueAsString(payload);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(synapseWebhookUrl, HttpMethod.POST, entity, String.class);

            response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            throw new RuntimeException("Failed to send SYNAPSE webhook", e);
        }
    }

    @Override
    public AuthDetails testWebhook(String email) {
        var auth = authRepository
                .findByEmailAndUserType(email, UserType.DOCTOR)
                .orElseThrow(() -> UserNotSignedUpException.withEmail(UserType.DOCTOR, email));

        var redirectUrl = urlUtil.generateHomeRedirectUrl(auth.getToken(), auth.getEmail());

        var details = doctorService.getDoctor(email);
        var synapseAuthDetailsResponse = AuthDetails.from(auth, redirectUrl, details);
        triggerSynapseWebhook(synapseAuthDetailsResponse);
        return null;
    }

    private void triggerSynapseWebhook(AuthDetails authDetails) {
        try {

            SynapseWebhookPayload payload = SynapseWebhookPayload.builder()
                    .timestamp(Instant.now())
                    .authDetails(authDetails)
                    .build();

            sendSynapseWebhook(payload);

        } catch (Exception ignore) {
        }
    }

    private HttpHeaders getHttpHeaders(SynapseWebhookPayload payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (synapseWebhookSecret != null && !synapseWebhookSecret.isEmpty()) {
            headers.set("X-Webhook-Secret", synapseWebhookSecret);
        }
        headers.set("X-Webhook-Source", "DentalStack-Auth");
        return headers;
    }
}
