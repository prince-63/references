package com.dentalstack.patient.feature.tracking.service;

public interface TrackingService {

    void reminderForPausedTreatment();

    void reminderForResumeTreatment();

    void refinementReminder();
}
