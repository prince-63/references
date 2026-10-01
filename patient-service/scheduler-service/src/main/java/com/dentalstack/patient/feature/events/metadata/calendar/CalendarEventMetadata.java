package com.dentalstack.patient.feature.events.metadata.calendar;

import com.dentalstack.patient.feature.calendar.dto.CalendarResponseTypes;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.EventMetadataType;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class CalendarEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long reminderId;
    private CalendarResponseTypes reminderType;
    private LocalDate reminderDate;
    private Long patientId;

    @JsonCreator
    public CalendarEventMetadata(
            long reminderId, CalendarResponseTypes reminderType, LocalDate reminderDate, Long patientId) {
        super(EventMetadataType.CALENDAR_REMINDER);
        this.reminderId = reminderId;
        this.reminderType = reminderType;
        this.reminderDate = reminderDate;
        this.patientId = patientId;
    }
}
