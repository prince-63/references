package com.dentalstack.auth.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetOrCreateNewDoctorRequest {
    private String email;
    private String name;
    private String lastName;
    private String profilePictureUrl;
}
