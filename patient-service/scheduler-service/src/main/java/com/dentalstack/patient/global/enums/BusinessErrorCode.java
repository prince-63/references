package com.dentalstack.patient.global.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum BusinessErrorCode {
    // Aligner journey related
    ALIGNER_JOURNEY_NOT_FOUND("PA001"),
    PATIENT_INVITATION_ALREADY_EXISTS("PI001"),
    PATIENT_ALREADY_ASSIGNED_TO_DOCTOR("PI002"),
    ACTIVE_ALIGNER_JOURNEY_FOUND("PI003"),
    PAUSED_ALIGNER_JOURNEY_FOUND("PI004"),
    ALIGNER_JOURNEY_DEACTIVATED("PI005"),

    // Reminder related
    REMINDER_ALREADY_EXISTS("PR001"),
    FAILED_SCHEDULE_REMINDER("PR002"),

    // Aligner production lab related
    ALIGNER_PRODUCTION_LAB_NOT_FOUND("AL001"),
    NO_ACTIVE_ALIGNER_PRODUCTION_ORDER_FOUND("AL002"),
    ALIGNER_PRODUCTION_ALREADY_EXISTS("AL003"),

    // Aligner production reminder related
    ALIGNER_PRODUCTION_REMINDER_NOT_FOUND("APR001"),

    // Aligner note related
    NOTE_NOT_FOUND("AN001"),

    // Invitation related
    ALREADY_INVITED("AI001"),
    FAILED_TO_GENERATE_INVITATION_CODE("AI002"),
    INVALID_INVITE_CODE("AI003"),
    INVITATION_NOT_FOUND("AI004"),
    BRACE_PATIENT_FOUND("AI004"),

    // Doctor related
    DOCTOR_NOT_FOUND("DI001"),

    // Appointment related
    APPOINTMENT_NOT_FOUND("AP001"),
    APPOINTMENT_REMINDER_NOT_FOUND("AP002"),
    APPOINTMENT_ALREADY_EXISTS("AP003"),
    APPOINTMENT_REMINDER_NOT_ADDED("AP004"),
    APPOINTMENT_REMINDER_ALREADY_EXIST("AP005"),

    // Files related
    INVALID_PATH_FOUND("F00001"),
    FILE_ALREADY_EXISTS("F00002"),
    FILES_NOT_SUPPORTED("F00003"),
    FILE_NOT_FOUND("F00004"),
    FAILED_TO_MOVE("F00005"),
    NOT_A_FOLDER("F00006"),
    FILE_OPERATION_NOT_ALLOWED("F00007"),
    FAILED_DOWNLOAD_FILE("F00008"),

    // Braces related
    BRACES_NOT_FOUND("BR0001"),

    // Payment related
    PAYMENT_NOT_FOUND("PY0001"),

    // Treatment related
    TREATMENT_NOT_FOUND("T0001"),
    INCORRECT_TREATMENT_COST("T00002"),

    // Reminder related
    REMINDER_NOT_FOUND("RM0001"),
    REMINDER_ALREADY_TRIGGERED("RM0002"),

    // General
    BAD_REQUEST("400"),

    // Material
    MATERIAL_ALREADY_PRESENT("M00001"),
    BRACKET_NAME_ALREADY_PRESENT("M00001"),

    // TreatmentPLan related
    ACTIVE_TREATMENT_PLAN_FOUND("TP0001"),
    TREATMENT_PLAN_NOT_FOUND("TP0002"),
    CAN_NOT_PAUSE_RESUME("TP0002"),

    DUPLICATE_NAME_FOUND("TP0004"),

    // Tracking related
    TRACKING_NOT_FOUND("TR0001"),

    // ALIGNER ACTION RELATED
    ALIGNER_ACTION_NOT_FOUND("AC0001"),

    // Subscription related
    SUBSCRIPTION_NOT_FOUND("SP0001"),
    SUBSCRIPTION_EXTENSION("SP0002"),
    PATIENT_LIMIT_EXCEEDED("SP0003"),
    STORAGE_LIMIT_EXCEEDED("SP0004"),

    // Order related
    ORDER_NOT_FOUND("OR0001"),
    APP_NAME_ALREADY_EXISTS("OR0002"),

    // Practice location related
    PRACTICE_LOCATION_NOT_FOUND("PL0001");

    private final String code;

    @JsonValue
    public String getCode() {
        return code;
    }
}
