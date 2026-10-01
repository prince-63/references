package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTreatmentType {

    private ProductTypeName productTypeName;

    private List<TreatmentType> treatmentType;

    private Long patientId;
}
