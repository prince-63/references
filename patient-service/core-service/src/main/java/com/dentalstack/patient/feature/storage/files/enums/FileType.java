package com.dentalstack.patient.feature.storage.files.enums;

import java.util.List;

public enum FileType {
    IMAGES,
    PRE_TREATMENT,
    SCAN,
    X_RAY,
    DOCUMENT;

    public static FileType fromExtension(String extension) {
        if (List.of("png", "jpg", "jpeg", "svg", "apng").contains(extension)) {
            return IMAGES;
        }
        return DOCUMENT;
    }
}
