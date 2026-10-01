package com.dentalstack.patient.feature.app_dentals.service;

import com.dentalstack.patient.feature.app_dentals.dto.AppDetailsRequest;
import com.dentalstack.patient.feature.app_dentals.dto.AppDetailsResponse;
import java.util.List;

public interface AppDetailsService {
    List<AppDetailsResponse> getAllAppDetails();

    AppDetailsResponse updateAppDetailsByAppName(AppDetailsRequest request);

    AppDetailsResponse createNewAppDetails(AppDetailsRequest request);
}
