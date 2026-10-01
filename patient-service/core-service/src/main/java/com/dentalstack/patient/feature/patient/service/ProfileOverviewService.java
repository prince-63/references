package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.patient.dto.PatientProfileOverviewActionRequest;
import com.dentalstack.patient.feature.patient.dto.PatientProfileOverviewActionResponse;
import java.util.List;

public interface ProfileOverviewService {
    PatientProfileOverviewActionResponse getPatientOverviewActions(PatientProfileOverviewActionRequest request);

    List<PatientProfileOverviewActionResponse> getPatientOverviewActionsWithListOfAlignerJourney(
            PatientProfileOverviewActionRequest request);
}
