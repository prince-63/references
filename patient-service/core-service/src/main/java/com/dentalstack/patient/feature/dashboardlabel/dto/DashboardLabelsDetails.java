package com.dentalstack.patient.feature.dashboardlabel.dto;

import com.dentalstack.patient.feature.dashboardlabel.entity.DashboardLabels;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardLabelsDetails {

    private String home;
    private String workspace;
    private String customerView;
    private String labView;
    private long profileId;

    public static DashboardLabelsDetails from(DashboardLabels dashboardLabels) {
        return DashboardLabelsDetails.builder()
                .home(dashboardLabels.getHome())
                .customerView(dashboardLabels.getCustomerView())
                .labView(dashboardLabels.getLabView())
                .profileId(dashboardLabels.getProfileId())
                .workspace(dashboardLabels.getWorkspace())
                .build();
    }

    public static DashboardLabelsDetails defaultLabels(long profileId) {
        return DashboardLabelsDetails.builder()
                .home("Home")
                .customerView("Customer view")
                .labView("Lab view")
                .profileId(profileId)
                .workspace("WorkSpace")
                .build();
    }
}
