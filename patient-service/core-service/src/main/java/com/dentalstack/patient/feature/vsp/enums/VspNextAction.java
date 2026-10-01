package com.dentalstack.patient.feature.vsp.enums;

public enum VspNextAction {
    CREATE_ORDER("No VSP order found. Create a new order to get started."),
    SEND_ORDER("Order is in draft. Submit your order to begin the review process."),
    WAITING_FOR_TREATMENT_PLAN("Order submitted. Waiting for the treatment plan to be prepared."),
    APPROVE_PLAN("Your treatment plan is ready for review. Please approve the plan."),
    REQUEST_REVISION("Revision requested. Waiting for the lab to prepare a revised plan."),
    NEED_MORE_INFO("More information is required. Please provide additional details."),
    COMPLETE_ORDER("Order approved. Complete the order to finish."),
    ORDER_SHIPPED("Order has been shipped. Waiting for delivery."),
    ORDER_DELIVERED("Order has been delivered.");

    private final String message;

    VspNextAction(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
