package com.dentalstack.chat.dto.ordermanagement;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderManagementEmailRequest {
    private String serviceType;
    private LocalDate date;
    private String email;
    private String practiceName;
    private Integer totalAligners;
    private String upperJawSeries;
    private String lowerJawSeries;
    private String treatmentPlanName;

    private String orderSenderEmail;
    private String orderSenderName;
    private String orderReceiverName;
    private String orderReceiverEmail;
    private LocalDate dueBy;
    private String orderType;
    private String orderId;
    private String patientName;
    private String treatmentPlanId;
    private String replanComment;
    private String stlFileType;
    private String orgName;
    private String remarks;
}
