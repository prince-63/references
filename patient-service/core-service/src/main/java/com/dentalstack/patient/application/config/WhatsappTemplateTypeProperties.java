package com.dentalstack.patient.application.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "whatsapp.template.type")
@Data
public class WhatsappTemplateTypeProperties {

    private String PATIENT_CONNECTED;
    private String NEW_PATIENT_ADDED_BY_PRACTICE;
    private String NEW_PATIENT_ASSIGNED_BY_ADMIN;

    private String NEW_CASE;
    private String CASE_ASSIGNED;
    private String CASE_MOVED_TO_PLANNING;
    private String CASE_MOVED_TO_PRODUCTION;
    private String CASE_READY_TO_BEGIN_TREATMENT;
    private String STATUS_UPDATED;

    private String PLAN_RECEIVED;
    private String PLAN_APPROVED;
    private String REVISION_REQUESTED;
    private String PLAN_FINALIZED;
    private String PLANNING_COMPLETED;

    private String STL_FILES_REQUESTED;
    private String STL_FILES_UPLOADED;

    private String NEW_COMMENT;

    private String ALIGNERS_SHIPPED;
    private String ALIGNERS_DELIVERED;

    private String ALIGNER_CHANGE_FROM_APP;
    private String ALIGNER_CHECKIN;
    private String REPORTED_ISSUE;
    private String TREATMENT_STARTING_TODAY;

    private String VSP_CUSTOMER_INVITATION_SENT;
    private String VSP_CUSTOMER_CASE_SUBMITTED;
    private String VSP_CUSTOMER_NEED_MORE_INFORMATION;
    private String VSP_CUSTOMER_PLAN_READY_FOR_REVIEW;
    private String VSP_CUSTOMER_PLAN_APPROVED;
    private String VSP_CUSTOMER_ORDER_SHIPPED;

    private String VSP_LAB_NEW_CASE_RECEIVED;
    private String VSP_LAB_CASE_ASSIGNED;
    private String VSP_LAB_PLAN_APPROVED;
    private String VSP_LAB_REVISION_REQUESTED;
    private String VSP_LAB_ORDER_SHIPPED;
    private String VSP_LAB_PRODUCTION_ORDER_CREATED;
    private String PATIENT_PLANNING_ADDED;
    private String STL_PLANNING_FILES_UPLOADED;
    private String CASE_PLANNING_COMPLETED;
    private String PLAN_PLANNING_APPROVED;
    private String REVISION_PLANNING_REQUEST_SENT;
    private String PLAN_PLANNING_READY_FOR_REVIEW;
    private String PLANNING_MORE_INFORMATION_REQUIRED;
    private String PLANNING_NEW_MESSAGE_RECEIVED;
}
