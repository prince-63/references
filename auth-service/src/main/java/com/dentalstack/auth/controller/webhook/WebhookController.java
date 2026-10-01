package com.dentalstack.auth.controller.webhook;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.service.webhook.WebhookService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/v1/webhook")
public class WebhookController {

    private final WebhookService webhookService;

    @GetMapping("/test/{email}")
    @Operation(summary = "test webhook")
    public ResponseEntity<AuthDetails> ssoUserLogin(@PathVariable(value = "email") String email) {
        return ResponseEntity.ok((webhookService.testWebhook(email)));
    }
}
