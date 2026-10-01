package com.dentalstack.patient.feature.caserecord.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "case_record")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class CaseRecord extends BaseEntity {

    private String caseRecordName;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "case_record_pre_treatment_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> preTreatmentFiles = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "case_record_scan_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> scanFiles = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinTable(name = "case_record_x_rays_files")
    @Builder.Default
    @ToString.Exclude
    private Set<File> xRaysFiles = new HashSet<>();

    private String orderId;
}
