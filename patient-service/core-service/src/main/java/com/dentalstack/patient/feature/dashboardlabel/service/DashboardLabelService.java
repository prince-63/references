package com.dentalstack.patient.feature.dashboardlabel.service;

import com.dentalstack.patient.feature.dashboardlabel.dto.DashboardLabelRequest;
import com.dentalstack.patient.feature.dashboardlabel.dto.DashboardLabelsDetails;

public interface DashboardLabelService {
    DashboardLabelsDetails saveOrUpdateDashboardLabels(DashboardLabelRequest request);

    DashboardLabelsDetails getDashboardLabels(long profileId);
}
