package com.dentalstack.chat.service.whatsapp.impl;

import com.dentalstack.chat.dto.whatsapp.WhatsAppRequest;
import com.dentalstack.chat.service.whatsapp.WhatsAppService;
import com.dentalstack.chat.util.ResolveAiSensyApiKey;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@RequiredArgsConstructor
@Service
public class WhatsAppServiceImpl implements WhatsAppService {

    @Value("${whatsapp.api.url}")
    private String whatsappApiUrl;

    private final ResolveAiSensyApiKey resolveAiSensyApiKey;

    private final RestTemplate restTemplate;

    @Override
    public String sendTemplateMessage(WhatsAppRequest request) {
        log.error("sendTemplateMessage: {}", request.toString());
        String apiKey = resolveAiSensyApiKey.resolve(request.getOrgName());

        if (request.getDestination() == null || request.getDestination().isEmpty()) {
            return "Destination number is required";
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("apiKey", apiKey);
        payload.put("campaignName", request.getCampaignName());
        payload.put("destination", request.getDestination());
        payload.put("userName", request.getUserName());
        payload.put("templateParams", request.getTemplateParams());
        payload.put("source", request.getSource());
        payload.put("media", request.getMedia());
        payload.put("buttons", request.getButtons());
        payload.put("carouselCards", request.getCarouselCards());
        payload.put("location", request.getLocation());
        payload.put("attributes", request.getAttributes());
        payload.put("paramsFallbackValue", request.getParamsFallbackValue());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        ResponseEntity<String> response =
                restTemplate.exchange(whatsappApiUrl, HttpMethod.POST, requestEntity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            log.error("WhatsApp API call failed with status: {}", response.getStatusCode());
            return "API call failed with status: " + response.getStatusCode();
        }
        return "Message sent successfully: " + response.getBody();
    }
}
