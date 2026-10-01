package com.dentalstack.patient.feature.whatsapp.dto;

import com.dentalstack.patient.feature.whatsapp.enums.OrgName;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WhatsAppRequest {
    private String apiKey;
    private String campaignName;
    private String destination;
    private String userName;
    private List<String> templateParams;
    private String source;
    private Map<String, Object> media;
    private List<Object> buttons;
    private List<Object> carouselCards;
    private Map<String, Object> location;
    private Map<String, Object> attributes;
    private Map<String, String> paramsFallbackValue;
    private OrgName orgName;

    public static WhatsAppRequest from() {
        return WhatsAppRequest.builder()
                .userName("Ardentous Technologies Private Limited")
                .source("new-landing-page form")
                .build();
    }
}
