package com.dentalstack.patient.feature.caseinfo.entity;

import com.dentalstack.patient.feature.caseinfo.Metadata;
import com.dentalstack.patient.feature.caseinfo.dto.CaseInformationRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.Type;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "case_information")
public class CaseInformation extends BaseEntity {

    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "patient_id")
    private Long patientId;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Metadata metadata;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "case_info_file")
    private List<File> files = new ArrayList<>();

    public static CaseInformation from(@NonNull CaseInformationRequest request, Long userId, Long doctorId) {
        return CaseInformation.builder()
                .patientId(userId)
                .doctorId(doctorId)
                .metadata(request.getMetadata())
                .build();
    }
}
