package com.dentalstack.patient.feature.aligner.util;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.user.enums.UserType;

public final class AlignerChangeEventUtil {

    private AlignerChangeEventUtil() {}

    public static boolean isManuallyAlignerChanged(Aligner aligner, EventRepository eventRepository) {
        boolean hasForceChange = !eventRepository
                .findAlignerChangeEventsByUserAndPreviousAlignerNo(
                        aligner.getAlignerJourney().getPatient().getId(),
                        String.valueOf(UserType.PATIENT),
                        String.valueOf(EventType.FORCE_ALIGNER_CHANGE),
                        aligner.getSrNo(),
                        aligner.getAlignerJourney().getId())
                .isEmpty();

        boolean hasManualChange = !eventRepository
                .findAlignerChangeEventsByDoctorAndPreviousAlignerNo(
                        aligner.getAlignerJourney().getPatient().getId(),
                        String.valueOf(UserType.PATIENT),
                        String.valueOf(EventType.MANUAL_ALIGNER_CHANGE),
                        aligner.getSrNo(),
                        aligner.getAlignerJourney().getId())
                .isEmpty();

        return hasForceChange || hasManualChange;
    }
}
