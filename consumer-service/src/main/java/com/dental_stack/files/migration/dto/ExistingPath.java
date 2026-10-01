package com.dental_stack.files.migration.dto;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@Builder
public class ExistingPath {
    private final String path;
    private final String driveFileId;
    private final boolean root;

    public static ExistingPath root() {
        return ExistingPath.builder().path("").driveFileId(null).root(true).build();
    }
}
