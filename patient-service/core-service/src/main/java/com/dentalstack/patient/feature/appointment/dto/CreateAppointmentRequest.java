package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateAppointmentRequest {
    private long bracesJourneyId;
    private Double amount;
    private AppointmentStatus status;
    private long doctorId;
    private long patientId;
    private ProductTypeName productTypeName;
    private List<JawDetails> jawDetails;
    private ZonedDateTime startDate;

    private ZonedDateTime endDate;
    private long reminderId;
}
