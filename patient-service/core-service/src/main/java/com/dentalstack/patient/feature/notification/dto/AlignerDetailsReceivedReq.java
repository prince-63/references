package com.dentalstack.patient.feature.notification.dto;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlignerDetailsReceivedReq {

    private String doctorFirstName;
    private String doctorLastName;
    private String patientFirstName;
    private String doctorEmail;
    private Long patientId;
    private Long alignerJourneyId;

    public static AlignerDetailsReceivedReq from(Patient patient, DoctorDetails doctor, Long alignerJourneyId) {
        return AlignerDetailsReceivedReq.builder()
                .doctorFirstName(doctor.getFirstName())
                .doctorLastName(doctor.getLastName())
                .doctorEmail(doctor.getEmail())
                .patientFirstName(patient.getFirstName())
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .build();
    }
}
