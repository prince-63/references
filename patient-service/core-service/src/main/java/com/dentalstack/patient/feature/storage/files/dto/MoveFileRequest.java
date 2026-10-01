package com.dentalstack.patient.feature.storage.files.dto;

import com.dentalstack.patient.feature.user.enums.UserType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoveFileRequest {
    private long requesterUserId;

    @NotNull
    private UserType requesterUserType;

    private long fileId;

    @Nullable
    private String newParentPath;
}
