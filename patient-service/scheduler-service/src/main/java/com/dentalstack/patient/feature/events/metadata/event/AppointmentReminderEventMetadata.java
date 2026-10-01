package com.dentalstack.patient.feature.events.metadata.event;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class AppointmentReminderEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;

    @JsonCreator
    public AppointmentReminderEventMetadata(Long patientId) {
        super(EventMetadataType.APPOINTMENT_REMINDER);
        this.patientId = patientId;
    }
}
