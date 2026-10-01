package com.dentalstack.chat.dto.chat;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddPatientToChatRequest {

    private List<Long> patientId;

    private Long doctorId;
    private Long profileId;
}
