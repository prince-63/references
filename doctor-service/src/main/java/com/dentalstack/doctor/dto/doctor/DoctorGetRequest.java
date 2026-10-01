package com.dentalstack.doctor.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorGetRequest {
    private String email;
    private String name;
    private String lastName;
    private String profilePictureUrl;
}
