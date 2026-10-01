package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.feature.user.dto.UserId;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeleteAllOwnerFilesRequest {
    @NotNull
    private UserId owner;

    @NotNull
    private UserId deleter;
}
