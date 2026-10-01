package com.dentalstack.patient.global.dto.notes;

import com.dentalstack.patient.feature.producttype.dto.producttype.ProductType;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@NonNull
public class NotesDetails {

    private long doctorId;

    private long patientId;

    private String title;

    private ProductType productType;

    private String note;
}
