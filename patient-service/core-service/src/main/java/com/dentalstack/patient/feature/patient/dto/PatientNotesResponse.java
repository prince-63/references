package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.entity.PatientNotes;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientNotesResponse {
    private String notes;
    private String addedByUserName;
    private Long patientId;
    private Long noteId;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static PatientNotesResponse from(PatientNotes patientNotes) {
        return PatientNotesResponse.builder()
                .notes(patientNotes.getNotes())
                .addedByUserName(
                        patientNotes.getAddedBy() != null
                                ? patientNotes.getAddedBy().getUser().fullNameWithSalutation()
                                : null)
                .patientId(
                        patientNotes.getPatient() != null
                                ? patientNotes.getPatient().getId()
                                : null)
                .noteId(patientNotes.getId())
                .createdAt(patientNotes.getCreatedAt() != null ? patientNotes.getCreatedAt() : null)
                .updatedAt(patientNotes.getUpdatedAt() != null ? patientNotes.getUpdatedAt() : null)
                .build();
    }
}
