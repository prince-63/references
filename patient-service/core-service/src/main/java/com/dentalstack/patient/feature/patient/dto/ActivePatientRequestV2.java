package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import jakarta.annotation.Nullable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivePatientRequestV2 {
    private int pageNumber;
    private int pageSize;
    private long doctorId;
    private long profileId;
    private long organizationId;
    private String search;
    private AppInviteStatus filterByAppInviteStatus;
    private AlignerTreatmentStage filterByGlobalStatus;
    private PatientType patientType;
    private Boolean isPatientCountRequest;
    private String customerMappedId;

    @Nullable
    private List<Long> practiceProfileIds;

    @Nullable
    private List<Long> practiceLocationIds;

    @Nullable
    private PracticeFilter practiceFilter;

    @Nullable
    private TreatmentTypeFilter treatmentTypeFilter;

    private List<String> filterByBrandName;

    private DoctorRole doctorRole;
    private DoctorRole customerOrPracticeRole;

    public enum TreatmentTypeFilter {
        ALL,
        ALIGNER
    }

    public enum PracticeFilter {
        ALL,
        ASSIGNED,
        UNASSIGNED,
        BY_PROFILE_ID,
    }
}
