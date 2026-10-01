package com.dentalstack.chat.dto.email.planninglab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LabEmailRequest {
    private String labName;
    private String email;
    private String labCompanyName;
    private String labUserName;
    private String companyName;
    private String uniqueUrl;
    private String customerName;
    private String labAdminName;
    private String orderId;
    private String treatmentPlanName;
    private Integer newOrderCount;
    private Integer inProgressOrderCount;

    private Integer assignedOrderCount;

    private Integer orderDueCount;
    private Integer orderDueTodayCount;
    private Integer stlFileRequestCount;
    private Integer rePlanOrderCount;
    private String dashboardLink;

    private Integer reviewAndApproveStlFileCount;
    private Integer confirmAndSendDraftOrderCount;
    private Integer approveTreatmentPlanCount;
    private String inviteCode;
    private String orgEmail;
    private String orgName;
}
