package com.dentalstack.patient.feature.patient.enums;

public enum NextAction {
    CREATE_ORDER("No treatment plan found. Create a new order to get started."),
    SEND_ORDER("Order is in draft. Submit your order to begin the review process."),
    WAITING_FOR_TREATMENT_PLAN("Order submitted. Waiting for the treatment plan to be prepared."),
    APPROVE_PLAN("Your treatment plan is ready for review. Please approve the plan."),
    REQUEST_STL_FILES("Plan approved. Request STL files to proceed with treatment."),
    WAITING_FOR_STL_FILES("STL files have been requested. Waiting for files to be uploaded."),
    COMPLETE_ORDER("STL files received. Complete the order to finish treatment."),

    RE_PLAN("Re-plan requested. Waiting for the lab to prepare a revised treatment plan.");

    private final String message;

    NextAction(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
