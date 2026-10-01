package com.dentalstack.patient.feature.storage.files.dto;

import com.dentalstack.patient.global.dto.UserId;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeleteFilesRequest {

    @NotNull
    private UserId owner;

    @NotNull
    private UserId deleter;

    private Set<String> filesToDelete;

    private Set<Long> filesToDeleteById;

    private long appointmentId;

    @Nullable
    private FileDeleteContext deleteContext;

    private Long contextId;

    public enum FileDeleteContext {
        SHIPPING
    }
}
