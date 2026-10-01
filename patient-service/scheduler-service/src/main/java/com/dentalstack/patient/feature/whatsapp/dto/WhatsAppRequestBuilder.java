package com.dentalstack.patient.feature.whatsapp.dto;

import com.dentalstack.patient.feature.whatsapp.enums.OrgName;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppRequestBuilder {

    public Optional<WhatsAppRequest> buildRequestIfMobileExists(
            Boolean isWhatsAppMessagingEnabled,
            OrgName orgName,
            String mobileNo,
            String template,
            List<String> templateParams) {
        if (Boolean.TRUE.equals(isWhatsAppMessagingEnabled)) {
            return Optional.ofNullable(mobileNo)
                    .filter(mobile -> !mobile.isBlank())
                    .map(mobile -> createWhatsAppRequest(template, mobile, templateParams, orgName));
        }
        return Optional.empty();
    }

    public WhatsAppRequest createWhatsAppRequest(
            String template, String mobileNo, List<String> templateParams, OrgName orgName) {
        var whatsAppRequest = WhatsAppRequest.from();
        whatsAppRequest.setCampaignName(template);
        whatsAppRequest.setDestination(mobileNo);
        whatsAppRequest.setTemplateParams(templateParams);
        whatsAppRequest.setOrgName(orgName);
        return whatsAppRequest;
    }
}
