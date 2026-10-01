package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.enums.JawType;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewAlignerDetails {
    private Integer alignerNo;
    private JawType jawType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int noOfDaysToWear;
}
