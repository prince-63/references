package com.dentalstack.patient.feature.notification.dto;

import com.dentalstack.patient.feature.notification.enums.OrgName;
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
