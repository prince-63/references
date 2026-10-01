package com.dentalstack.patient.feature.order.enums;

public enum OrderStatus {
    DRAFT,
    IN_PROGRESS, // user action pending
    IN_REVIEW, // customer action pending
    ORDERED,
    RE_PLAN,
    COMPLETED,
    CANCELLED,
    ON_HOLD,
    STL_FILES_REQUESTED,
    STL_FILES_UPLOADED,
    APPROVED
}
