package com.dentalstack.patient.feature.storage.exception;

public class PhotoMappingNotFoundException extends RuntimeException {
    public PhotoMappingNotFoundException(String originalFilename) {
        super(String.format("Photo mapping not found of filename %s", originalFilename));
    }
}
