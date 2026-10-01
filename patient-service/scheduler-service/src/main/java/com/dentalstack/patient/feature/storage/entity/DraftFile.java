package com.dentalstack.patient.feature.storage.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "draft_files")
public class DraftFile extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull
    private String name;

    @NotNull
    private String url;

    @NotNull
    private String fullPath;

    private long ownerUserId;

    @Enumerated(EnumType.STRING)
    private UserType ownerUserType;

    private long createdBy;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType createdByUserType;

    @Nullable
    private Long deletedBy;

    @Nullable
    @Enumerated(EnumType.STRING)
    private UserType deletedByUserType;

    private long size;

    public static DraftFile from(
            String url,
            long ownerUserId,
            @NotNull UserType ownerUserType,
            long uploaderUserId,
            @NotNull UserType uploaderUserType,
            String fileName,
            String filePath,
            long size) {
        return DraftFile.builder()
                .url(url)
                .ownerUserId(ownerUserId)
                .ownerUserType(ownerUserType)
                .createdBy(uploaderUserId)
                .createdByUserType(uploaderUserType)
                .name(fileName)
                .fullPath(filePath)
                .size(size)
                .build();
    }
}
