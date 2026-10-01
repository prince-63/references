package com.dentalstack.doctor.dto.whatsapp.request;

import com.dentalstack.doctor.dto.whatsapp.WhatsAppRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppRequestBuilder {

    public Optional<WhatsAppRequest> buildRequestIfMobileExists(
            String mobileNo, String template, List<String> templateParams) {
        return Optional.ofNullable(mobileNo)
                .filter(mobile -> !mobile.isBlank())
                .map(mobile -> createWhatsAppRequest(template, mobile, templateParams));
    }

    public WhatsAppRequest createWhatsAppRequest(String template, String mobileNo, List<String> templateParams) {
        var whatsAppRequest = WhatsAppRequest.from();
        whatsAppRequest.setCampaignName(template);
        whatsAppRequest.setDestination(mobileNo);
        whatsAppRequest.setTemplateParams(templateParams);
        return whatsAppRequest;
    }
}
