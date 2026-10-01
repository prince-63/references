package com.dentalstack.chat.dto.file;

import java.util.List;

public enum FileType {
    IMAGES,
    DOCUMENT;

    public static FileType fromExtension(String extension) {
        if (List.of("png", "jpg", "jpeg", "svg", "apng").contains(extension)) {
            return IMAGES;
        }
        return DOCUMENT;
    }
}
