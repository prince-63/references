package com.dentalstack.patient.feature.treatmenttracking.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class ChangeAlignerRequest {

    private LocalDate changeDate;
}
