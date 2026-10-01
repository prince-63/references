package com.dentalstack.patient.feature.storage.files.entity;

import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.storage.files.enums.FileType;
import com.dentalstack.patient.feature.storage.files.enums.HasShared;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;

@Entity
@Table(
        name = "file",
        indexes = {@Index(name = "IX_file_name", columnList = "name")})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class File extends BaseEntity {

    private String driveFileId;

    @NotNull
    private String name;

    private String url;

    private String thumbnailUrl;

    private String downloadUrl;

    private long uploaderUserId;

    @Enumerated(EnumType.STRING)
    private UserType uploaderUserType;

    private Long deletedBy;

    @Enumerated(EnumType.STRING)
    private UserType deletedByUserType;

    private ZonedDateTime deletedAt;

    @Builder.Default
    private boolean folder = false;

    @Nullable
    @Enumerated(EnumType.STRING)
    private FileType type;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Nullable
    private String extension;

    @OneToMany(mappedBy = "file", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<FilePermission> filePermissions = new ArrayList<>();

    @OneToMany(mappedBy = "file", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<FileOwner> owners = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "parentFile", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<File> childrenFiles = new ArrayList<>();

    @NotNull
    private String fullPath;

    private long size;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_file_id")
    private File parentFile;

    @Builder.Default
    private boolean isDefaultFolder = false;

    @Builder.Default
    private boolean isPatientFolder = false;

    @Builder.Default
    private boolean isFilesFromTreatmentPlan = false;

    private Long ownerUserId;

    @Enumerated(EnumType.STRING)
    private UserType ownerUserType;

    @Builder.Default
    private boolean isFileDisplayToPatient = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    private Long cloneFromFileId;
    private Boolean isPurchaseOrderFile;

    private Boolean isGDrivePlatform;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "file_shared_with", joinColumns = @JoinColumn(name = "file_id"))
    @Column(name = "shared_with")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @ToString.Exclude
    private Set<HasShared> sharedWith = new HashSet<>();

    public static File newFolder(
            UserId uploader,
            Set<UserId> owners,
            String folderName,
            File parentFile,
            String fullPath,
            PatientDoctorOrganization userProfile) {
        var file = File.builder()
                .name(folderName)
                .uploaderUserId(uploader.getUserId())
                .uploaderUserType(uploader.getUserType())
                .folder(true)
                .fullPath(fullPath)
                .parentFile(parentFile)
                .status(Status.ACTIVE)
                .size(0)
                .isFilesFromTreatmentPlan(false)
                .isFileDisplayToPatient(true)
                .userProfile(userProfile.getUserProfile())
                .organization(userProfile.getOrganization())
                .build();

        setOwnerAndPerms(file, uploader, owners);

        return file;
    }

    public static File newFolder(
            UserId uploader,
            Set<UserId> owners,
            String folderName,
            File parentFile,
            String fullPath,
            UserProfile userProfile,
            boolean isGDrivePlatform,
            String driveFileId) {
        var file = File.builder()
                .name(folderName)
                .uploaderUserId(uploader.getUserId())
                .uploaderUserType(uploader.getUserType())
                .folder(true)
                .fullPath(fullPath)
                .parentFile(parentFile)
                .status(Status.ACTIVE)
                .size(0)
                .isFilesFromTreatmentPlan(false)
                .isFileDisplayToPatient(true)
                .userProfile(userProfile)
                .organization(userProfile.getOrganization())
                .isGDrivePlatform(isGDrivePlatform)
                .driveFileId(driveFileId)
                .build();

        setOwnerAndPerms(file, uploader, owners);

        return file;
    }

    public static File cloneFile(File cloneFile) {
        return File.builder()
                .name(cloneFile.getName())
                .url(cloneFile.getUrl())
                .uploaderUserId(cloneFile.getUploaderUserId())
                .uploaderUserType(cloneFile.getUploaderUserType())
                .folder(cloneFile.isFolder())
                .type(cloneFile.getType())
                .extension(cloneFile.getExtension())
                .fullPath(cloneFile.getFullPath())
                .parentFile(cloneFile.getParentFile())
                .status(cloneFile.getStatus())
                .size(cloneFile.getSize())
                .isFilesFromTreatmentPlan(cloneFile.isFilesFromTreatmentPlan())
                .isFileDisplayToPatient(cloneFile.isFileDisplayToPatient())
                .userProfile(cloneFile.getUserProfile())
                .organization(cloneFile.getOrganization())
                .filePermissions(new ArrayList<>(cloneFile.getFilePermissions()))
                .owners(new ArrayList<>(cloneFile.getOwners()))
                .childrenFiles(new ArrayList<>(cloneFile.getChildrenFiles()))
                .build();
    }

    public static File newFile(
            UserId uploader,
            Set<UserId> owners,
            String fileName,
            String filePath,
            String url,
            File parentFile,
            long size,
            PatientDoctorOrganization userProfile) {
        var extension = FilenameUtils.getExtension(fileName).toLowerCase();
        var file = File.builder()
                .name(fileName)
                .url(url)
                .uploaderUserId(uploader.getUserId())
                .uploaderUserType(uploader.getUserType())
                .folder(false)
                .type(FileType.fromExtension(extension))
                .extension(extension)
                .fullPath(filePath)
                .parentFile(parentFile)
                .status(Status.ACTIVE)
                .size(size)
                .isFilesFromTreatmentPlan(false)
                .isFileDisplayToPatient(true)
                .userProfile(userProfile.getUserProfile())
                .organization(userProfile.getOrganization())
                .build();

        setOwnerAndPerms(file, uploader, owners);

        return file;
    }

    public static File newFile(
            UserId uploader,
            Set<UserId> owners,
            String fileName,
            String filePath,
            String url,
            String thumbnailUrl,
            String downloadUrl,
            File parentFile,
            Long size,
            UserProfile userProfile,
            boolean isGDrivePlatform,
            String driveFileId) {
        var extension = FilenameUtils.getExtension(fileName).toLowerCase();
        var file = File.builder()
                .name(fileName)
                .url(url)
                .uploaderUserId(uploader.getUserId())
                .uploaderUserType(uploader.getUserType())
                .folder(false)
                .type(FileType.fromExtension(extension))
                .extension(extension)
                .fullPath(filePath)
                .parentFile(parentFile)
                .status(Status.ACTIVE)
                .size(size)
                .isFilesFromTreatmentPlan(false)
                .isFileDisplayToPatient(true)
                .userProfile(userProfile)
                .organization(userProfile.getOrganization())
                .thumbnailUrl(thumbnailUrl)
                .downloadUrl(downloadUrl)
                .isGDrivePlatform(isGDrivePlatform)
                .driveFileId(driveFileId)
                .build();

        setOwnerAndPerms(file, uploader, owners);

        return file;
    }

    private static void setOwnerAndPerms(File file, UserId uploader, Set<UserId> owners) {
        Set<FilePermission> perms = new HashSet<>();
        Set<FileOwner> fileOwners = new HashSet<>();

        for (var user : owners) {
            for (var p : user.getPermissions()) {
                perms.add(new FilePermission(user.getUserId(), user.getUserType(), p, file));
            }
            fileOwners.add(new FileOwner(user.getUserId(), user.getUserType(), file));
        }

        for (var p : uploader.getPermissions()) {
            perms.add(new FilePermission(uploader.getUserId(), uploader.getUserType(), p, file));
        }

        file.setFilePermissions(new ArrayList<>(perms));
        file.setOwners(new ArrayList<>(fileOwners));
    }

    public void addChildFile(File file) {
        if (childrenFiles == null) {
            childrenFiles = new ArrayList<>();
        }
        childrenFiles.add(file);
    }

    public void delete(UserId deleter) {
        deletedBy = deleter.getUserId();
        deletedByUserType = deleter.getUserType();
        status = Status.DELETED;
        deletedAt = ZonedDateTime.now();
        for (var childFile : childrenFiles) {
            childFile.delete(deleter);
        }
    }

    public long size() {
        Set<File> uniqueFiles = new HashSet<>();
        return size + calculateChildrenSize(uniqueFiles);
    }

    private long calculateChildrenSize(Set<File> uniqueFiles) {
        return childrenFiles.stream()
                .filter(child -> child.getStatus().equals(Status.ACTIVE))
                .filter(uniqueFiles::add)
                .mapToLong(File::size)
                .sum();
    }

    public void removeChildFile(File file) {
        if (childrenFiles == null) {
            return;
        }

        childrenFiles.removeIf(f -> f.getId().equals(file.getId()));
    }

    public void setFullPath(String fullPath) {
        this.fullPath = StringUtils.removeEnd(fullPath, "/");
    }
}
