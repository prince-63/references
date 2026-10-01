package com.dentalstack.patient.feature.storage.exception;

public class FailedToUploadAlignerPhotoException extends RuntimeException {
    public FailedToUploadAlignerPhotoException(Long patientId, Long alignerJourneyId) {
        super(String.format(
                "failed to upload photo of patient %d for aligner journey %d", patientId, alignerJourneyId));
    }
}
