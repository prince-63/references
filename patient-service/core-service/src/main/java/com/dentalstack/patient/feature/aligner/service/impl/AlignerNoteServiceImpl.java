package com.dentalstack.patient.feature.aligner.service.impl;

import com.dentalstack.patient.feature.aligner.cache.AlignerCacheEvict;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.AddNoteRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.DeleteNoteRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.note.UpdateNoteRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourneyNote;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.note.AlignerNoteNotFoundException;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.service.AlignerNoteService;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AlignerNoteServiceImpl implements AlignerNoteService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerCacheEvict cacheEvict;

    @Transactional(dontRollbackOn = {BusinessException.class})
    @Override
    public AlignerJourney addNote(AddNoteRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.isTreatmentDeactivated();
        cacheEvict.evictProductionCache(alignerJourney.getDoctorId());

        alignerJourney
                .getNotes()
                .add(AlignerJourneyNote.builder()
                        .alignerJourney(alignerJourney)
                        .title(request.getTitle())
                        .text(request.getText())
                        .addedBy(request.getUserId())
                        .addedByUserType(request.getUserType())
                        .active(true)
                        .build());

        log.info(
                "Added new note for aligner journey {} by {} with id {}",
                alignerJourneyId,
                request.getUserType(),
                request.getUserId());
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    @Transactional(dontRollbackOn = {BusinessException.class})
    public AlignerJourney updateNote(UpdateNoteRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var noteId = request.getNoteId();
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        alignerJourney.isTreatmentDeactivated();

        var note = alignerJourney.getNotes().stream()
                .filter(AlignerJourneyNote::isActive)
                .filter(n -> n.getId().equals(noteId))
                .findFirst()
                .orElseThrow(() -> new AlignerNoteNotFoundException(alignerJourneyId, noteId));

        if (note.getAddedBy() != request.getUpdatedBy()
                || !note.getAddedByUserType().equals(request.getUpdatedByUser())) {
            throw new BadRequestException("Note can only be updated by the user who has added it");
        }

        if (request.getText() != null) {
            note.setText(request.getText());
        }

        if (request.getTitle() != null) {
            note.setTitle(request.getTitle());
        }

        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    @Transactional(dontRollbackOn = {BusinessException.class})
    public AlignerJourney deleteNote(DeleteNoteRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var noteId = request.getNoteId();
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        var note = alignerJourney.getNotes().stream()
                .filter(n -> n.getId().equals(noteId))
                .findFirst()
                .orElseThrow(() -> new AlignerNoteNotFoundException(alignerJourneyId, noteId));

        note.setActive(false);

        return alignerJourneyRepository.save(alignerJourney);
    }
}
