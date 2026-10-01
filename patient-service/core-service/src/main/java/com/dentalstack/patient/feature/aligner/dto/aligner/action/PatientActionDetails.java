package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientActionDetails {

    private TrackingType type;

    private AlignerTreatmentStatus status;

    private AlignerUpdateCategory alignerChanged;

    private AlignerUpdateCategory alignerCheckInReported;

    private AlignerUpdateCategory issueReported;
}
