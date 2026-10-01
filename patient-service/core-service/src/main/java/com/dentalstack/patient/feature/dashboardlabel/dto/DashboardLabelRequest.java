package com.dentalstack.patient.feature.dashboardlabel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardLabelRequest {
    private String home;
    private String workspace;
    private String customerView;
    private String labView;
    private long profileId;
}
