package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.vsp.enums.VspCaseRecordMode;
import com.dentalstack.patient.feature.vsp.enums.VspCaseRecordStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.*;

@Entity
@Table(
        name = "vsp_case_record",
        indexes = {
            @Index(name = "IX_vsp_case_record_order_id", columnList = "vsp_order_id"),
            @Index(name = "IX_vsp_case_record_status", columnList = "status")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspCaseRecord extends BaseEntity {

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_order_id", nullable = true)
    @ToString.Exclude
    private VspOrder vspOrder;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @ToString.Exclude
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private VspCaseRecordMode recordSelectionMode;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "vsp_case_record_extraoral_photo_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> extraoralPhotoFiles = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "vsp_case_record_intraoral_photo_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> intraoralPhotoFiles = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "vsp_case_record_intraoral_scan_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> intraoralScanFiles = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "vsp_case_record_stone_cast_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> stoneCastFiles = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "vsp_case_record_dicom_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> dicomFiles = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "vsp_case_record_radio_grap_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> radioGrapFiles = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "vsp_case_record_external_links", joinColumns = @JoinColumn(name = "vsp_case_record_id"))
    @Column(name = "external_link")
    @Builder.Default
    private List<String> externalLinks = new ArrayList<>();

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VspCaseRecordStatus status = VspCaseRecordStatus.DRAFT;
}
