package com.dental_stack.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnprocessedAlignerDue {
    private String email;
    private String patientName;
    private String dueDate;
    private String upperStart;
    private String upperEnd;
    private String lowerStart;
    private String lowerEnd;
    private String orgName;
}
