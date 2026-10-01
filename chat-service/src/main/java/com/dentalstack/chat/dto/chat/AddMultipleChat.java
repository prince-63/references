package com.dentalstack.chat.dto.chat;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddMultipleChat {

    private List<PatientChat> patients;
    private String doctorName;
    private Long doctorId;
    private String message;
    private String roleName;
    private String createdBy;
    private Boolean isMessageSentFromPatientOverview;
    private Integer alignerSrNo;
}
