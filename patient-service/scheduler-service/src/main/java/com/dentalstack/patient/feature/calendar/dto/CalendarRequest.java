package com.dentalstack.patient.feature.calendar.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalendarRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private long doctorId;
    private Long organizationId;
    private Long profileId;
}
