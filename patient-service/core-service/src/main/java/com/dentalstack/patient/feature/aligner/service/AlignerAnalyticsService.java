package com.dentalstack.patient.feature.aligner.service;

import com.dentalstack.patient.feature.aligner.dto.analytics.*;
import java.util.List;

public interface AlignerAnalyticsService {
    AlignerAnalyticsCountResponse getChartCountData(ChartCountForAnalyticsRequest request);

    AlignerPatientAnalyticsDetailsResponse getPatientsAnalyticsDetails(AlignerPatientAnalyticsDetailsRequest request);

    List<PatientRemindAllForAnalytics> getPatientForRemindAll(ChartCountForAnalyticsRequest request);
}
