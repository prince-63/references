package com.dentalstack.chat.controller.v1.whatsappnotification;

import com.dentalstack.chat.dto.whatsapp.WhatsAppRequest;
import com.dentalstack.chat.service.whatsapp.WhatsAppService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Whatsapp notifications", description = "APIs for managing WhatsApp notifications")
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/chat/whatsapp/notification/v1/")
public class WhatsAppController {

    private final WhatsAppService whatsAppService;

    @PostMapping("/send-message")
    public ResponseEntity<String> sendWhatsAppMessage(@RequestBody WhatsAppRequest request) {
        try {
            String response = whatsAppService.sendTemplateMessage(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok("Failed to send message: " + e.getMessage());
        }
    }
}
