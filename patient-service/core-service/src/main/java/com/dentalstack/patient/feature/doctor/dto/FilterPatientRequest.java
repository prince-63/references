package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterPatientRequest {

    private List<Compliance> complianceList;
    private List<String> brandFilters;
    private Long doctorId;
    private List<String> practiceLocation;
    private PatientStatus patientStatus;
}
