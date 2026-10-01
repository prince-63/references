package com.dentalstack.patient.feature.doctor.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MiniDashboardDetailsResponse {
    private Long totalPatients;
    private Long totalCustomerOrders;
    private LocalDateTime lastOrderAt;
    private Boolean customerTrackingEnabled;
    private Boolean customerStlFileViewEnabled;
    private Boolean customerScanFileViewEnabled;
    private Boolean customerPrintFileViewEnabled;
}
