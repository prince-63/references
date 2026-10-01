package com.dentalstack.doctor.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDoctorEmailRequest {
    private Long doctorId;
    private String email;
}
