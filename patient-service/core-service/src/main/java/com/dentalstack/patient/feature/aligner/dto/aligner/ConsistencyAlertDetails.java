package com.dentalstack.patient.feature.aligner.dto.aligner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsistencyAlertDetails {
    private Long untrackedDays;
    private Long ghostLogs;
}
