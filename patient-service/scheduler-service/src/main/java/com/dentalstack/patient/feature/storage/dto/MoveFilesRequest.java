package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.global.enums.UserType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoveFilesRequest {
    private long requesterUserId;

    @NotNull
    private UserType requesterUserType;

    @NotNull
    private List<Long> fileIds;

    @Nullable
    private String newParentPath;
}
