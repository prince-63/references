package com.dentalstack.patient.feature.user.dto;

import com.dentalstack.patient.feature.storage.enums.FilePermissionType;
import com.dentalstack.patient.global.enums.UserType;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@EqualsAndHashCode
public class UserId {
    private long userId;

    @NotNull
    private UserType userType;

    @Builder.Default
    private Set<FilePermissionType> permissions = Set.of(FilePermissionType.READ, FilePermissionType.WRITE);
}
