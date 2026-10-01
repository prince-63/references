package com.dentalstack.patient.feature.tracking.service;

import com.dentalstack.patient.feature.tracking.dto.GetTrackingResponse;
import com.dentalstack.patient.feature.tracking.dto.StlFileToggleRequest;
import com.dentalstack.patient.global.enums.ProductTypeName;

public interface TrackingService {

    GetTrackingResponse getTracking(Long doctorId, Long patientId, ProductTypeName treatmentSubtype);

    void reminderForPausedTreatment();

    void reminderForResumeTreatment();

    void refinementReminder();

    void toggleIsTrackingForCustomer(Long profileId);

    void toggleDetails(StlFileToggleRequest request);
}
