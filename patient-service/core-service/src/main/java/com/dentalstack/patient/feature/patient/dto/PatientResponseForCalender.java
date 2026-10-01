package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponseForCalender {

    private Long patientId;
    private String patientName;
    private String profilePictureUrl;
    private Boolean isTrackingAdded;
    private BigDecimal amountDue;
    private Long practiceLocationId;
    private boolean isTreatmentCostAdded;
    private Boolean hasOngoingOrders;
    private Boolean hasAnyOrder;
    private PatientType patientType;

    public static PatientResponseForCalender from(PatientSummary patientSummary) {
        String firstName = patientSummary.getFirstName();
        String lastName = patientSummary.getLastName();
        String fullName;

        if (lastName != null) {
            fullName = (firstName != null) ? firstName + " " + lastName : lastName;
        } else {
            fullName = (firstName != null) ? firstName : "";
        }

        return PatientResponseForCalender.builder()
                .patientId(patientSummary.getPatientId())
                .patientName(fullName)
                .profilePictureUrl(patientSummary.getProfilePictureUrl())
                .isTrackingAdded(patientSummary.getIsTrackingAdded())
                .amountDue(patientSummary.getAmountDue())
                .practiceLocationId(patientSummary.getPracticeLocationId())
                .isTreatmentCostAdded(patientSummary.getIsTreatmentAdded())
                .hasOngoingOrders(patientSummary.getHasOngoingOrders())
                .hasAnyOrder(patientSummary.getHasAnyOrders())
                .patientType(patientSummary.getPatientType())
                .build();
    }
}
