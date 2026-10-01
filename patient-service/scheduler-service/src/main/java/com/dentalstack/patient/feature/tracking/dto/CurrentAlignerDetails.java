package com.dentalstack.patient.feature.tracking.dto;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
public class CurrentAlignerDetails {

    private Integer number;
    private LocalDate startDate;
    private LocalDate endDate;

    public static CurrentAlignerDetails from(Integer number, LocalDate startDate, LocalDate endDate) {
        return CurrentAlignerDetails.builder()
                .number(number)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }
}
