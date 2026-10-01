package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivePatientRequest {
    private int pageNumber;
    private int pageSize;
    private long doctorId;
    private long profileId;
    private long organizationId;
    private String search;
    private List<String> practiceLocation;
    private List<String> treatments;
    private boolean archive;
    private AppInviteStatus filterByAppInviteStatus;
    private AlignerTreatmentStage filterByGlobalStatus;
    private String filterByTreatmentType;
    private String filterByPracticeName;
    private DoctorRole filterByRole;
    private Long patientId;
}
