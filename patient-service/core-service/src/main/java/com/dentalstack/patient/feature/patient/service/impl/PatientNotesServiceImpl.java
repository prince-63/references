package com.dentalstack.patient.feature.patient.service.impl;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.patient.dto.PatientNotesRequest;
import com.dentalstack.patient.feature.patient.dto.PatientNotesResponse;
import com.dentalstack.patient.feature.patient.dto.UpdatePatientNotesRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientNotes;
import com.dentalstack.patient.feature.patient.repository.PatientNotesRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.PatientNotesService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientNotesServiceImpl implements PatientNotesService {

    private final PatientNotesRepository patientNotesRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public PatientNotesResponse addNote(PatientNotesRequest noteRequest) {
        Patient patient = patientRepository
                .findById(noteRequest.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found with id: " + noteRequest.getPatientId()));

        UserProfile userProfile = userProfileRepository
                .findById(noteRequest.getProfileId())
                .orElseThrow(() -> new GenericException("User not found with id: " + noteRequest.getProfileId()));

        PatientNotes note = PatientNotes.builder()
                .notes(noteRequest.getNotes())
                .patient(patient)
                .addedBy(userProfile)
                .build();
        patientNotesRepository.save(note);

        return PatientNotesResponse.from(note);
    }

    @Override
    @Transactional
    public PatientNotesResponse updateNote(UpdatePatientNotesRequest request) {
        PatientNotes existingNote = patientNotesRepository
                .findByIdAndPatientId(request.getNoteId(), request.getPatientId())
                .orElseThrow(() -> new GenericException("Note not found with id: " + request.getNoteId()
                        + " for patient id: " + request.getPatientId()));

        var userProfile = userProfileRepository
                .findById(request.getUserProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getUserProfileId()));
        existingNote.setNotes(request.getNotes());
        existingNote.setUpdatedAt(ZonedDateTime.now());
        existingNote.setAddedBy(userProfile);
        patientNotesRepository.save(existingNote);
        return PatientNotesResponse.from(existingNote);
    }

    @Override
    @Transactional
    public void deleteNote(Long patientId, Long noteId) {
        PatientNotes note = patientNotesRepository
                .findByIdAndPatientId(noteId, patientId)
                .orElseThrow(() ->
                        new GenericException("Note not found with id: " + noteId + " for patient id: " + patientId));

        patientNotesRepository.delete(note);
    }

    @Override
    public List<PatientNotesResponse> getNotesByPatientId(Long patientId) {
        List<PatientNotes> notes = patientNotesRepository.findByPatientIdWithUserProfile(patientId);
        return notes.stream().map(PatientNotesResponse::from).collect(Collectors.toList());
    }

    @Override
    public List<PatientNotesResponse> getNotesByProfileId(Long profileId, Long patientId) {
        List<PatientNotes> notes =
                patientNotesRepository.findByProfileIdAndPatientIdWithUserProfile(profileId, patientId);
        return notes.stream().map(PatientNotesResponse::from).collect(Collectors.toList());
    }
}
