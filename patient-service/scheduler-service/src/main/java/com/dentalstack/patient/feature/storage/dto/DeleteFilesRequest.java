package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.feature.user.dto.UserId;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeleteFilesRequest {

    @NotNull
    private UserId owner;

    @NotNull
    private UserId deleter;

    private Set<String> filesToDelete;

    private Set<Long> filesToDeleteById;

    private long appointmentId;
}
