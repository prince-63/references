package com.dentalstack.patient.feature.whatsapp.dto;

import com.dentalstack.patient.feature.whatsapp.enums.OrgName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrgWhatsAppDetails {
    private boolean isWhatsAppMessagingEnabled;
    private OrgName orgName;
}
