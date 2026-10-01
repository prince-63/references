package com.dentalstack.patient.feature.workflow.core.task_tracker.projection;

import java.time.ZonedDateTime;

public interface TimeStamped {
    ZonedDateTime getTimestamp();
}
