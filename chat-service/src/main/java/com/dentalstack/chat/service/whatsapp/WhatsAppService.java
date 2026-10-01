package com.dentalstack.chat.service.whatsapp;

import com.dentalstack.chat.dto.whatsapp.WhatsAppRequest;

public interface WhatsAppService {
    String sendTemplateMessage(WhatsAppRequest request);
}
