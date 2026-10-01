package com.dentalstack.patient.feature.braces.service;

import com.dentalstack.patient.feature.braces.dto.BracesJourneyDetails;
import com.dentalstack.patient.feature.braces.dto.CreateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.dto.FilterBracesJourneysRequest;
import com.dentalstack.patient.feature.braces.dto.UpdateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.dto.app.BracesAppDashboardDetails;
import com.dentalstack.patient.feature.braces.dto.app.ReportBracesIssueRequest;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import java.util.List;

public interface BracesJourneyService {

    BracesJourneyDetails createBracesJourney(CreateBracesJourneyRequest request);

    BracesJourneyDetails updateBracesJourney(UpdateBracesJourneyRequest request);

    List<BracesJourneyDetails> getBracesJourney(Long bracesJourneyId);

    List<BracesJourneyDetails> getBracesJourneyDetails(Long doctorId, BracesTreatmentStage status);

    @Deprecated
    List<BracesJourneyDetails> getBracesJourneyDetailsForWeb(Long doctorId, BracesTreatmentStage status);

    List<BracesJourneyDetails> getBracesJourneyDetailsForOrganization(
            Long doctorId, BracesTreatmentStage status, long profileId, long organizationId);

    List<BracesJourneyDetails> getBracesJourneyDetailsForDashboard(Long doctorId);

    void startTreatment(boolean isTreatmentStarted, Long patientId);

    BracesJourney discardBracesJourney(Long bracesJourneyId);

    List<BracesJourneyDetails> getFilteredBracesJourneys(FilterBracesJourneysRequest request);

    BracesAppDashboardDetails getBracesAppDashboardDetails(Long patientId);

    void reportIssue(ReportBracesIssueRequest request);
}
