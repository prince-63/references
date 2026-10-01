package com.dentalstack.patient.feature.notification.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailSendReq {

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;

    private String patientFirstName;

    private String orgName;
    private String practiceAdminName;
    private String inviteCode;
    private String name;
    private String treatmentPlanName;
    private LocalDate date;
    private Long patientId;
    private String salutation;
    private String serviceType;
    private String email;
    private String practiceName;
    private Integer totalAligners;
    private String upperJawSeries;
    private String lowerJawSeries;

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
    private String trackingNumber;
    private String trackingLink;
    private LocalDate tentativeDeliveryDate;
}
