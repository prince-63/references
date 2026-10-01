package com.dentalstack.patient.feature.storage.gallery.exception;

public class AlignerPhotoAlreadyExistsException extends RuntimeException {
    public AlignerPhotoAlreadyExistsException(String photoFilename, int alignerNo, Long alignerJourneyId) {
        super(String.format(
                "Aligner photo with name %s already exists for aligner no %d in journey %d",
                photoFilename, alignerNo, alignerJourneyId));
    }
}
