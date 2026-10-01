package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
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
