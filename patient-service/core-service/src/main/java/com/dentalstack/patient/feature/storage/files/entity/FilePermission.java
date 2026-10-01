package com.dentalstack.patient.feature.storage.files.entity;

import com.dentalstack.patient.feature.storage.files.enums.FilePermissionType;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "file_permission")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@EqualsAndHashCode(callSuper = false)
public class FilePermission extends BaseEntity {

    private long userId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType userType;

    private FilePermissionType permission;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private File file;
}
