package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.patient.dto.PatientNotesRequest;
import com.dentalstack.patient.feature.patient.dto.PatientNotesResponse;
import com.dentalstack.patient.feature.patient.dto.UpdatePatientNotesRequest;
import java.util.List;

public interface PatientNotesService {
    PatientNotesResponse addNote(PatientNotesRequest noteRequest);

    PatientNotesResponse updateNote(UpdatePatientNotesRequest noteRequest);

    void deleteNote(Long patientId, Long noteId);

    List<PatientNotesResponse> getNotesByPatientId(Long patientId);

    List<PatientNotesResponse> getNotesByProfileId(Long profileId, Long patientId);
}
