package com.dentalstack.doctor.dto.chat;

import java.util.List;
import lombok.Data;

@Data
public class DoctorResponse {

    private List<Long> patientIds;
}
