package com.dentalstack.patient.feature.storage.exception;

public class PhotoNotUploadedException extends RuntimeException {
    public PhotoNotUploadedException(String photoFileName) {
        super(String.format("Photo not uploaded with file name %s", photoFileName));
    }
}
