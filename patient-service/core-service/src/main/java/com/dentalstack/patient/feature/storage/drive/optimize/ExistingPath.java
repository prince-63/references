package com.dentalstack.patient.feature.storage.drive.optimize;

import lombok.*;

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
