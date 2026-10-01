package com.dental_stack.notification.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
    private String orgEmail;
    private Long patientId;
    private String salutation;
    private LocalTime startTime;
    private LocalTime endTime;

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
