package com.dentalstack.chat.dto.chat;

import java.util.List;
import lombok.Data;

@Data
public class PatientRequest {

    private List<Long> patientIds;
}
