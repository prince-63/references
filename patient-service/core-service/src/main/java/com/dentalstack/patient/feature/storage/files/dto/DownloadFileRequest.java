package com.dentalstack.patient.feature.storage.files.dto;

import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DownloadFileRequest {
    private long requesterUserId;
    private long profileId;
    private long organizationId;

    @NotNull
    private UserType requesterUserType;

    private long fileId;
}
