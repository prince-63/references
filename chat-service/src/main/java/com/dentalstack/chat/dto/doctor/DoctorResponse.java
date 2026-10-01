package com.dentalstack.chat.dto.doctor;

import java.util.List;
import lombok.Data;

@Data
public class DoctorResponse {
    private List<Long> patientIds;
}
