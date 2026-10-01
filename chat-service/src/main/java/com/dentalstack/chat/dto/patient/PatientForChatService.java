package com.dentalstack.chat.dto.patient;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientForChatService {

    private String patientName;

    private String patientMobile;
}
