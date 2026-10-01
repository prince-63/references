package com.dentalstack.doctor.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorForChatService {

    private String doctorName;

    private String doctorMobile;

    private String email;
    private String doctorProfile;
    private Long doctorProfileId;
}
