package com.dentalstack.patient.feature.reminder.entity;

import java.io.Serializable;

public enum ReminderStatus implements Serializable {
    ACTIVE,
    INACTIVE,
    TRIGGERED,
    FAILED
}
