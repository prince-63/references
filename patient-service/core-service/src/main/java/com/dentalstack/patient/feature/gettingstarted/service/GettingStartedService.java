package com.dentalstack.patient.feature.gettingstarted.service;

import com.dentalstack.patient.feature.gettingstarted.dto.*;

public interface GettingStartedService {
    void skipGettingStarted(SkipGettingStartedRequest request);

    DoctorDashboardGettingStartedDetails gettingStartedDetails(GettingStartedRequest request);

    GettingStartedResponse gettingStartedOverviewDetails(GettingStartedDetailsRequest request);
}
