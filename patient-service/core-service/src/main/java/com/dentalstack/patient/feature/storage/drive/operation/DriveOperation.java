package com.dentalstack.patient.feature.storage.drive.operation;

import com.google.api.services.drive.Drive;

public interface DriveOperation<T, R> {

    R execute(Drive drive, T context) throws Exception;

    default void validate(T context) {
        if (context == null) {
            throw new IllegalArgumentException("Operation context cannot be null");
        }
    }
}
