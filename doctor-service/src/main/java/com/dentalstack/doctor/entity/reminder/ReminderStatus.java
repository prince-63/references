package com.dentalstack.doctor.entity.reminder;

import java.io.Serializable;

public enum ReminderStatus implements Serializable {
    ACTIVE,
    INACTIVE,
    TRIGGERED,
    FAILED
}
