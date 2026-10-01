package com.dentalstack.patient.feature.patient.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerChangeDetails extends ActionDetailsBase {

    private LocalDate changeDate;
    private LocalTime time;
    private int dueBy;
    private Boolean moveToPreviousAlignerEnable;
    private LocalDate alignerEndDate;
    private LocalDate alignerStartDate;
}
