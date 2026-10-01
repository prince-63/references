package com.dentalstack.chat.dto.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsentEmailReq {
    private String orgName;
    private String email;
    private String userName;
    private String patientName;
    private String consentType;
}
