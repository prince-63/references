package com.dentalstack.patient.feature.patient.service.impl;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.*;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerNotFoundException;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerPhotoRepository;
import com.dentalstack.patient.feature.aligner.util.AlignerChangeEventUtil;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.service.ProfileOverviewService;
import com.dentalstack.patient.feature.reminder.entity.CustomAppointmentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerChangeData;
import com.dentalstack.patient.feature.timeline.metadata.event.ForceAlignerChangeEventEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.ManualAlignerChangeEventEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.WearDaysUpdateEventMetaData;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileOverviewServiceImpl implements ProfileOverviewService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final TrackingRepository trackingRepository;
    private final AlignerPhotoRepository alignerPhotoRepository;
    private final EventRepository eventRepository;
    private final ReminderRepository reminderRepository;

    @Transactional(readOnly = true)
    @Override
    public PatientProfileOverviewActionResponse getPatientOverviewActions(PatientProfileOverviewActionRequest request) {
        Optional<AlignerJourney> alignerJourneyOptional;
        if (request.getTreatmentPlanId() != null) {
            alignerJourneyOptional = trackingRepository.findByPatientAndTreatmentPlanId(
                    request.getPatientId(), request.getTreatmentPlanId());

        } else {
            alignerJourneyOptional =
                    alignerJourneyRepository.findLatestAlignerJourneyByPatientId(request.getPatientId());
        }

        if (alignerJourneyOptional.isEmpty()) {
            return PatientProfileOverviewActionResponse.builder()
                    .pendingActionsCount(0)
                    .aligners(List.of())
                    .build();
        }

        var alignerJourney = alignerJourneyOptional.get();
        var patientProfileOverviewResponse = getPatientOverviewDetails(alignerJourney);

        var aligners = alignerJourney.getAligners();
        List<AlignerData> alignerDataList = new ArrayList<>();

        var treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();
        var alignerDetailsMetadata = treatmentPlan.getAlignerDetailsMetadata();
        var upperRange = alignerDetailsMetadata.getUpperJawDetails().getRange();
        var lowerRange = alignerDetailsMetadata.getLowerJawDetails().getRange();

        final int[] rangeValues = AlignerJourney.determineOverallRange(upperRange, lowerRange);
        final int lowestSrNo = rangeValues[0];
        final int highestSrNo = rangeValues[1];

        var alignerDetails = alignerJourney.getAligners().stream()
                .sorted(Comparator.comparing(Aligner::getSrNo))
                .filter(aligner -> {
                    int srNo = aligner.getSrNo();
                    return srNo >= lowestSrNo && srNo <= highestSrNo;
                })
                .toList();

        if (request.getFilter() == PatientProfileOverviewActionRequest.Filter.CURRENT_ALIGNER
                && alignerJourney.getCurrentAligner() != null) {
            alignerDetails = aligners.stream()
                    .filter(aligner -> aligner.getId()
                            .equals(alignerJourney.getCurrentAligner().getId()))
                    .collect(Collectors.toList());
        }

        for (Aligner aligner : alignerDetails) {
            List<AlignerActionData> actionDataList = new ArrayList<>();
            var actions = aligner.getActions();

            List<AlignerAction> filteredActions = filterAlignerActions(actions, request.getFilter());

            int alignerPendingActionsCount = 0;

            for (AlignerAction action : filteredActions) {
                AlignerActionData actionData = mapAlignerActionToActionData(action, alignerJourney, aligner);
                actionDataList.add(actionData);

                if (!action.isValidated()) {
                    alignerPendingActionsCount++;
                }
            }
            var nextAlignerNumber = aligner.getSrNo() + 1;

            var nextAligner = Optional.ofNullable(aligner.getAlignerJourney())
                    .map(journey -> {
                        try {
                            return journey.getAligner(nextAlignerNumber);
                        } catch (AlignerNotFoundException ignored) {
                            return null;
                        }
                    })
                    .orElse(null);

            var isMoveToPreviousAlignerEnable = false;
            if (alignerJourney.getCurrentAlignerNo() > 1
                    && alignerJourney.getCurrentAlignerNo() - 1 == aligner.getSrNo()) {
                boolean noMoveBackActions = Optional.ofNullable(nextAligner)
                        .map(next -> next.getActions().stream()
                                .noneMatch(a -> a.getType().equals(AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER)))
                        .orElse(false);

                boolean hasUnapprovedAlignerChange = aligner.getActions().stream()
                        .anyMatch(action ->
                                action.getType().equals(AlignerActionType.ALIGNER_CHANGE) && !action.isValidated());

                isMoveToPreviousAlignerEnable =
                        noMoveBackActions && hasUnapprovedAlignerChange && !isManuallyAlignerChanged(aligner);
            }

            List<AlignerActionData> statusActions = new ArrayList<>();

            if (request.getFilter() == null
                    || request.getFilter() == PatientProfileOverviewActionRequest.Filter.ALL_ALIGNERS
                                    | request.getFilter() == PatientProfileOverviewActionRequest.Filter.CURRENT_ALIGNER
                            && alignerJourney.getCurrentAligner() != null) {
                statusActions.addAll(getScheduledAlignerAction(aligner));
                statusActions.addAll(alignerScheduledActionData(aligner));
                if (alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                    var pauseResumeActions = getPauseResumeActions(alignerJourney);
                    statusActions.addAll(pauseResumeActions);
                }

                statusActions.addAll(getManualAlignerChange(request.getPatientId(), aligner));
                var reminderSentToPatient = isReminderSentToPatient(request.getPatientId(), aligner);
                if (reminderSentToPatient != null) {
                    statusActions.add(getReminderSentToPatient(reminderSentToPatient, aligner));
                }

                Integer daysOverdue = calculateOverdue(aligner, alignerJourney);

                if (aligner.getSrNo() >= alignerJourney.getInitialAlignerNumber()
                        && daysOverdue != null
                        && daysOverdue < 0
                        && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                    statusActions.add(getAlignerChangeOverduePendingAction(aligner));
                    statusActions.add(getAlignerChangeOverdue(aligner));
                }
                if (aligner.getSrNo() >= alignerJourney.getInitialAlignerNumber()) {
                    statusActions.addAll(getWearDaysUpdatedAction(request.getPatientId(), aligner));
                }
                if (alignerJourney.getTracking().getTreatmentPlan().getStatus() == AlignerTreatmentStatus.DEACTIVATED
                        && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                    statusActions.addAll(getDeactivateTreatmentAction(alignerJourney));
                }

            } else {
                boolean hasRelevantActions = false;

                switch (request.getFilter()) {
                    case PENDING_UPDATES:
                        if (patientProfileOverviewResponse.getPendingActionsCount() > 0) {
                            if (countPendingActionsByType(aligner, AlignerActionType.ISSUE_REPORT) > 0) {
                                statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                        .filter(action -> action.getActionType() == AlignerActionType.ISSUE_REPORT)
                                        .toList());
                                hasRelevantActions = true;
                            }

                            if (countPendingActionsByType(aligner, AlignerActionType.ALIGNER_CHANGE) > 0) {
                                statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                        .filter(action -> action.getActionType() == AlignerActionType.ALIGNER_CHANGE
                                                || action.getActionType()
                                                        == AlignerActionType.ALIGNER_CHANGE_PENDING_APPROVAL)
                                        .toList());
                                hasRelevantActions = true;
                            }

                            if (countPendingActionsByType(aligner, AlignerActionType.CHECK_IN) > 0) {
                                statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                        .filter(action -> action.getActionType() == AlignerActionType.CHECK_IN
                                                || action.getActionType()
                                                        == AlignerActionType.CHECK_IN_PENDING_APPROVAL)
                                        .toList());
                                hasRelevantActions = true;
                            }
                        }
                        break;
                    case ALIGNER_CHANGES:
                        hasRelevantActions = filteredActions.stream()
                                .anyMatch(action -> action.getType() == AlignerActionType.ALIGNER_CHANGE);

                        if (hasRelevantActions) {
                            statusActions.addAll(getForceAlignerChangeActions(request.getPatientId(), aligner));
                            statusActions.addAll(getManualAlignerChange(request.getPatientId(), aligner));
                            statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                    .filter(action -> action.getActionType() == AlignerActionType.ALIGNER_CHANGE
                                            || action.getActionType()
                                                    == AlignerActionType.ALIGNER_CHANGE_PENDING_APPROVAL)
                                    .toList());
                            var reminderSentToPatient = isReminderSentToPatient(request.getPatientId(), aligner);
                            if (reminderSentToPatient != null) {
                                statusActions.add(getReminderSentToPatient(reminderSentToPatient, aligner));
                            }
                        }
                        break;
                    case ALIGNER_CHECKINS:
                        hasRelevantActions = filteredActions.stream()
                                .anyMatch(action -> action.getType() == AlignerActionType.CHECK_IN);

                        if (hasRelevantActions) {
                            statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                    .filter(action ->
                                            action.getActionType() == AlignerActionType.CHECK_IN_PENDING_APPROVAL)
                                    .toList());
                        }
                        break;
                    case ISSUES_REPORTED:
                        actionDataList = actionDataList.stream()
                                .filter(action -> action.getActionType() == AlignerActionType.ISSUE_REPORT)
                                .collect(Collectors.toList());
                        hasRelevantActions = !actionDataList.isEmpty();
                        break;
                }

                if (hasRelevantActions
                        && request.getFilter() != PatientProfileOverviewActionRequest.Filter.PENDING_UPDATES) {
                    Integer daysOverdue = calculateOverdue(aligner, alignerJourney);
                    if (daysOverdue != null
                            && daysOverdue < 0
                            && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                        statusActions.add(getAlignerChangeOverduePendingAction(aligner));
                        statusActions.add(getAlignerChangeOverdue(aligner));
                    }
                    statusActions.addAll(alignerScheduledActionData(aligner));
                    if (alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                        var pauseResumeActions = getPauseResumeActions(alignerJourney);
                        statusActions.addAll(pauseResumeActions);
                        if (alignerJourney.getTracking().getTreatmentPlan().getStatus()
                                        == AlignerTreatmentStatus.DEACTIVATED
                                && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                            statusActions.addAll(getDeactivateTreatmentAction(alignerJourney));
                        }
                    }
                }

                if (request.getFilter() == PatientProfileOverviewActionRequest.Filter.PENDING_UPDATES
                        && alignerPendingActionsCount > 0) {
                    Integer daysOverdue = calculateOverdue(aligner, alignerJourney);
                    if (daysOverdue != null
                            && daysOverdue < 0
                            && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                        statusActions.add(getAlignerChangeOverduePendingAction(aligner));
                        statusActions.add(getAlignerChangeOverdue(aligner));
                    }
                    statusActions.addAll(alignerScheduledActionData(aligner));
                    if (alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                        var pauseResumeActions = getPauseResumeActions(alignerJourney);
                        statusActions.addAll(pauseResumeActions);
                        if (alignerJourney.getTracking().getTreatmentPlan().getStatus()
                                        == AlignerTreatmentStatus.DEACTIVATED
                                && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                            statusActions.addAll(getDeactivateTreatmentAction(alignerJourney));
                        }
                    }
                }
            }

            actionDataList.addAll(statusActions);

            if (actionDataList.isEmpty()
                    && request.getFilter() != null
                    && request.getFilter() != PatientProfileOverviewActionRequest.Filter.ALL_ALIGNERS
                    && request.getFilter() != PatientProfileOverviewActionRequest.Filter.CURRENT_ALIGNER) {
                continue;
            }
            actionDataList.sort((a1, a2) -> {
                if (a1.getPerformedAt() == null && a2.getPerformedAt() == null) {
                    return 0;
                } else if (a1.getPerformedAt() == null) {
                    return 1;
                } else if (a2.getPerformedAt() == null) {
                    return -1;
                } else {

                    return a1.getPerformedAt().compareTo(a2.getPerformedAt());
                }
            });

            JawType previousJawType = null;
            var currentAligner = alignerJourney.getCurrentAligner();
            int previousAlignerNumber = 0;
            if (currentAligner != null) {
                previousAlignerNumber = currentAligner.getSrNo() - 1;
            }
            if (previousAlignerNumber > 0) {
                var previousAligner = alignerJourney.getAligner(previousAlignerNumber);
                if (previousAligner != null) {
                    previousJawType = previousAligner.getJawType();
                    previousAlignerNumber = previousAligner.getSrNo();
                }
            }
            AlignerData alignerData = AlignerData.builder()
                    .alignerId(aligner.getId())
                    .alignerNumber(aligner.getSrNo())
                    .totalAligner(alignerJourney.getAligners().size())
                    .overDue(calculateOverdue(aligner, alignerJourney))
                    .startDate(aligner.getStartDate())
                    .endDate(aligner.getChangeDate() != null ? aligner.getChangeDate() : aligner.getEndDate())
                    .isAlignerChanged(isAlignerChanged(aligner) || isManuallyAlignerChanged(aligner))
                    .patientId(request.getPatientId())
                    .actions(actionDataList)
                    .alignerJourneyId(alignerJourney.getId())
                    .jawType(aligner.getJawType())
                    .currentAlignerJawType(Objects.requireNonNull(alignerJourney.getCurrentAligner())
                            .getJawType())
                    .currentAlignerNumber(alignerJourney.getCurrentAligner().getSrNo())
                    .isAlignerChangeApproved(isAlignerChangeApproved(aligner) || isManuallyAlignerChanged(aligner))
                    .pendingActionsCount(alignerPendingActionsCount)
                    .previousAlignerNumber(previousAlignerNumber)
                    .previousJawType(previousJawType)
                    .moveToPreviousAlignerEnable(isMoveToPreviousAlignerEnable)
                    .build();

            alignerDataList.add(alignerData);
        }

        alignerDataList.sort(Comparator.comparing(AlignerData::getAlignerNumber));

        patientProfileOverviewResponse.setTreatmentPlanStatus(treatmentPlan.getStatus());
        patientProfileOverviewResponse.setTreatmentPlanCompleted(
                treatmentPlan.getStatus().equals(AlignerTreatmentStatus.COMPLETE) ? true : false);
        patientProfileOverviewResponse.setTreatmentCompilationDate(
                treatmentPlan.getStatus().equals(AlignerTreatmentStatus.COMPLETE)
                        ? treatmentPlan.getUpdatedAt()
                        : null);
        patientProfileOverviewResponse.setTreatmentPlanCompletedRemarks(
                treatmentPlan.getTreatmentPlanCompletedRemarks());
        return PatientProfileOverviewActionResponse.builder()
                .patientProfileOverviewResponse(patientProfileOverviewResponse)
                .pendingActionsCount(patientProfileOverviewResponse.getPendingActionsCount())
                .aligners(alignerDataList)
                .build();
    }

    @Override
    public List<PatientProfileOverviewActionResponse> getPatientOverviewActionsWithListOfAlignerJourney(
            PatientProfileOverviewActionRequest request) {
        var alignerJourneyList = alignerJourneyRepository.findAllAlignerJourneyByPatientId(request.getPatientId());

        List<PatientProfileOverviewActionResponse> patientProfileOverviewActionResponseList = new ArrayList<>();
        if (alignerJourneyList.isEmpty()) {
            return patientProfileOverviewActionResponseList;
        }

        alignerJourneyList.sort((a1, a2) -> Long.compare(a2.getId(), a1.getId()));
        alignerJourneyList.forEach((alignerJourney -> {
            var patientProfileOverviewResponse = getPatientOverviewDetails(alignerJourney);

            var aligners = alignerJourney.getAligners();
            List<AlignerData> alignerDataList = new ArrayList<>();

            var treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();
            var alignerDetailsMetadata = treatmentPlan.getAlignerDetailsMetadata();
            var upperRange = alignerDetailsMetadata.getUpperJawDetails().getRange();
            var lowerRange = alignerDetailsMetadata.getLowerJawDetails().getRange();

            final int[] rangeValues = AlignerJourney.determineOverallRange(upperRange, lowerRange);
            final int lowestSrNo = rangeValues[0];
            final int highestSrNo = rangeValues[1];

            var alignerDetails = alignerJourney.getAligners().stream()
                    .sorted(Comparator.comparing(Aligner::getSrNo))
                    .filter(aligner -> {
                        int srNo = aligner.getSrNo();
                        return srNo >= lowestSrNo && srNo <= highestSrNo;
                    })
                    .toList();

            if (request.getFilter() == PatientProfileOverviewActionRequest.Filter.CURRENT_ALIGNER
                    && alignerJourney.getCurrentAligner() != null) {
                alignerDetails = aligners.stream()
                        .filter(aligner -> aligner.getId()
                                .equals(alignerJourney.getCurrentAligner().getId()))
                        .toList();
            }

            for (Aligner aligner : alignerDetails) {
                List<AlignerActionData> actionDataList = new ArrayList<>();
                var actions = aligner.getActions();

                List<AlignerAction> filteredActions = filterAlignerActions(actions, request.getFilter());

                int alignerPendingActionsCount = 0;

                for (AlignerAction action : filteredActions) {
                    AlignerActionData actionData = mapAlignerActionToActionData(action, alignerJourney, aligner);
                    actionDataList.add(actionData);

                    if (!action.isValidated()) {
                        alignerPendingActionsCount++;
                    }
                }
                var nextAlignerNumber = aligner.getSrNo() + 1;

                var nextAligner = Optional.ofNullable(aligner.getAlignerJourney())
                        .map(journey -> {
                            try {
                                return journey.getAligner(nextAlignerNumber);
                            } catch (AlignerNotFoundException ignored) {
                                return null;
                            }
                        })
                        .orElse(null);

                var isMoveToPreviousAlignerEnable = false;
                if (alignerJourney.getCurrentAlignerNo() > 1
                        && alignerJourney.getCurrentAlignerNo() - 1 == aligner.getSrNo()) {
                    boolean noMoveBackActions = Optional.ofNullable(nextAligner)
                            .map(next -> next.getActions().stream()
                                    .noneMatch(a -> a.getType().equals(AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER)))
                            .orElse(false);

                    boolean hasUnapprovedAlignerChange = aligner.getActions().stream()
                            .anyMatch(action ->
                                    action.getType().equals(AlignerActionType.ALIGNER_CHANGE) && !action.isValidated());

                    isMoveToPreviousAlignerEnable =
                            noMoveBackActions && hasUnapprovedAlignerChange && !isManuallyAlignerChanged(aligner);
                }

                List<AlignerActionData> statusActions = new ArrayList<>();

                if (request.getFilter() == null
                        || request.getFilter() == PatientProfileOverviewActionRequest.Filter.ALL_ALIGNERS
                                        | request.getFilter()
                                                == PatientProfileOverviewActionRequest.Filter.CURRENT_ALIGNER
                                && alignerJourney.getCurrentAligner() != null) {
                    statusActions.addAll(getScheduledAlignerAction(aligner));
                    statusActions.addAll(alignerScheduledActionData(aligner));
                    if (alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                        var pauseResumeActions = getPauseResumeActions(alignerJourney);
                        statusActions.addAll(pauseResumeActions);
                    }

                    statusActions.addAll(getManualAlignerChange(request.getPatientId(), aligner));
                    var reminderSentToPatient = isReminderSentToPatient(request.getPatientId(), aligner);
                    if (reminderSentToPatient != null) {
                        statusActions.add(getReminderSentToPatient(reminderSentToPatient, aligner));
                    }

                    Integer daysOverdue = calculateOverdue(aligner, alignerJourney);

                    if (aligner.getSrNo() >= alignerJourney.getInitialAlignerNumber()
                            && daysOverdue != null
                            && daysOverdue < 0
                            && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                        statusActions.add(getAlignerChangeOverduePendingAction(aligner));
                        statusActions.add(getAlignerChangeOverdue(aligner));
                    }
                    if (aligner.getSrNo() >= alignerJourney.getInitialAlignerNumber()) {
                        statusActions.addAll(getWearDaysUpdatedAction(request.getPatientId(), aligner));
                    }
                    if (alignerJourney.getTracking().getTreatmentPlan().getStatus()
                                    == AlignerTreatmentStatus.DEACTIVATED
                            && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                        statusActions.addAll(getDeactivateTreatmentAction(alignerJourney));
                    }

                } else {
                    boolean hasRelevantActions = false;

                    switch (request.getFilter()) {
                        case PENDING_UPDATES:
                            if (patientProfileOverviewResponse.getPendingActionsCount() > 0) {
                                if (countPendingActionsByType(aligner, AlignerActionType.ISSUE_REPORT) > 0) {
                                    statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                            .filter(action -> action.getActionType() == AlignerActionType.ISSUE_REPORT)
                                            .toList());
                                    hasRelevantActions = true;
                                }

                                if (countPendingActionsByType(aligner, AlignerActionType.ALIGNER_CHANGE) > 0) {
                                    statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                            .filter(action -> action.getActionType() == AlignerActionType.ALIGNER_CHANGE
                                                    || action.getActionType()
                                                            == AlignerActionType.ALIGNER_CHANGE_PENDING_APPROVAL)
                                            .toList());
                                    hasRelevantActions = true;
                                }

                                if (countPendingActionsByType(aligner, AlignerActionType.CHECK_IN) > 0) {
                                    statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                            .filter(action -> action.getActionType() == AlignerActionType.CHECK_IN
                                                    || action.getActionType()
                                                            == AlignerActionType.CHECK_IN_PENDING_APPROVAL)
                                            .toList());
                                    hasRelevantActions = true;
                                }
                            }
                            break;
                        case ALIGNER_CHANGES:
                            hasRelevantActions = filteredActions.stream()
                                    .anyMatch(action -> action.getType() == AlignerActionType.ALIGNER_CHANGE);

                            if (hasRelevantActions) {
                                statusActions.addAll(getForceAlignerChangeActions(request.getPatientId(), aligner));
                                statusActions.addAll(getManualAlignerChange(request.getPatientId(), aligner));
                                statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                        .filter(action -> action.getActionType() == AlignerActionType.ALIGNER_CHANGE
                                                || action.getActionType()
                                                        == AlignerActionType.ALIGNER_CHANGE_PENDING_APPROVAL)
                                        .toList());
                                var reminderSentToPatient = isReminderSentToPatient(request.getPatientId(), aligner);
                                if (reminderSentToPatient != null) {
                                    statusActions.add(getReminderSentToPatient(reminderSentToPatient, aligner));
                                }
                            }
                            break;
                        case ALIGNER_CHECKINS:
                            hasRelevantActions = filteredActions.stream()
                                    .anyMatch(action -> action.getType() == AlignerActionType.CHECK_IN);

                            if (hasRelevantActions) {
                                statusActions.addAll(getScheduledAlignerAction(aligner).stream()
                                        .filter(action ->
                                                action.getActionType() == AlignerActionType.CHECK_IN_PENDING_APPROVAL)
                                        .toList());
                            }
                            break;
                        case ISSUES_REPORTED:
                            actionDataList = actionDataList.stream()
                                    .filter(action -> action.getActionType() == AlignerActionType.ISSUE_REPORT)
                                    .collect(Collectors.toList());
                            hasRelevantActions = !actionDataList.isEmpty();
                            break;
                    }

                    if (hasRelevantActions
                            && request.getFilter() != PatientProfileOverviewActionRequest.Filter.PENDING_UPDATES) {
                        Integer daysOverdue = calculateOverdue(aligner, alignerJourney);
                        if (daysOverdue != null
                                && daysOverdue < 0
                                && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                            statusActions.add(getAlignerChangeOverduePendingAction(aligner));
                            statusActions.add(getAlignerChangeOverdue(aligner));
                        }
                        statusActions.addAll(alignerScheduledActionData(aligner));
                        if (alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                            var pauseResumeActions = getPauseResumeActions(alignerJourney);
                            statusActions.addAll(pauseResumeActions);
                            if (alignerJourney.getTracking().getTreatmentPlan().getStatus()
                                            == AlignerTreatmentStatus.DEACTIVATED
                                    && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                                statusActions.addAll(getDeactivateTreatmentAction(alignerJourney));
                            }
                        }
                    }

                    if (request.getFilter() == PatientProfileOverviewActionRequest.Filter.PENDING_UPDATES
                            && alignerPendingActionsCount > 0) {
                        Integer daysOverdue = calculateOverdue(aligner, alignerJourney);
                        if (daysOverdue != null
                                && daysOverdue < 0
                                && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                            statusActions.add(getAlignerChangeOverduePendingAction(aligner));
                            statusActions.add(getAlignerChangeOverdue(aligner));
                        }
                        statusActions.addAll(alignerScheduledActionData(aligner));
                        if (alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                            var pauseResumeActions = getPauseResumeActions(alignerJourney);
                            statusActions.addAll(pauseResumeActions);
                            if (alignerJourney.getTracking().getTreatmentPlan().getStatus()
                                            == AlignerTreatmentStatus.DEACTIVATED
                                    && alignerJourney.getCurrentAlignerNo() == aligner.getSrNo()) {
                                statusActions.addAll(getDeactivateTreatmentAction(alignerJourney));
                            }
                        }
                    }
                }

                actionDataList.addAll(statusActions);

                if (actionDataList.isEmpty()
                        && request.getFilter() != null
                        && request.getFilter() != PatientProfileOverviewActionRequest.Filter.ALL_ALIGNERS
                        && request.getFilter() != PatientProfileOverviewActionRequest.Filter.CURRENT_ALIGNER) {
                    continue;
                }
                actionDataList.sort((a1, a2) -> {
                    if (a1.getPerformedAt() == null && a2.getPerformedAt() == null) {
                        return 0;
                    } else if (a1.getPerformedAt() == null) {
                        return 1;
                    } else if (a2.getPerformedAt() == null) {
                        return -1;
                    } else {

                        return a1.getPerformedAt().compareTo(a2.getPerformedAt());
                    }
                });

                JawType previousJawType = null;
                var currentAligner = alignerJourney.getCurrentAligner();
                int previousAlignerNumber = 0;
                if (currentAligner != null) {
                    previousAlignerNumber = currentAligner.getSrNo() - 1;
                }
                if (previousAlignerNumber > 0) {
                    var previousAligner = alignerJourney.getAligner(previousAlignerNumber);
                    if (previousAligner != null) {
                        previousJawType = previousAligner.getJawType();
                        previousAlignerNumber = previousAligner.getSrNo();
                    }
                }
                AlignerData alignerData = AlignerData.builder()
                        .alignerId(aligner.getId())
                        .alignerNumber(aligner.getSrNo())
                        .totalAligner(alignerJourney.getAligners().size())
                        .overDue(calculateOverdue(aligner, alignerJourney))
                        .startDate(aligner.getStartDate())
                        .endDate(aligner.getChangeDate() != null ? aligner.getChangeDate() : aligner.getEndDate())
                        .isAlignerChanged(isAlignerChanged(aligner) || isManuallyAlignerChanged(aligner))
                        .patientId(request.getPatientId())
                        .actions(actionDataList)
                        .alignerJourneyId(alignerJourney.getId())
                        .jawType(aligner.getJawType())
                        .currentAlignerJawType(Objects.requireNonNull(alignerJourney.getCurrentAligner())
                                .getJawType())
                        .currentAlignerNumber(alignerJourney.getCurrentAligner().getSrNo())
                        .isAlignerChangeApproved(isAlignerChangeApproved(aligner) || isManuallyAlignerChanged(aligner))
                        .pendingActionsCount(alignerPendingActionsCount)
                        .previousAlignerNumber(previousAlignerNumber)
                        .previousJawType(previousJawType)
                        .moveToPreviousAlignerEnable(isMoveToPreviousAlignerEnable)
                        .build();

                alignerDataList.add(alignerData);
            }

            alignerDataList.sort(Comparator.comparing(AlignerData::getAlignerNumber));

            patientProfileOverviewResponse.setTreatmentPlanStatus(treatmentPlan.getStatus());
            patientProfileOverviewResponse.setTreatmentPlanCompleted(
                    treatmentPlan.getStatus().equals(AlignerTreatmentStatus.COMPLETE) ? true : false);
            patientProfileOverviewResponse.setTreatmentCompilationDate(
                    treatmentPlan.getStatus().equals(AlignerTreatmentStatus.COMPLETE)
                            ? treatmentPlan.getUpdatedAt()
                            : null);
            patientProfileOverviewResponse.setTreatmentPlanCompletedRemarks(
                    treatmentPlan.getTreatmentPlanCompletedRemarks());
            PatientProfileOverviewActionResponse patientProfileOverviewActionResponse =
                    PatientProfileOverviewActionResponse.builder()
                            .patientProfileOverviewResponse(patientProfileOverviewResponse)
                            .pendingActionsCount(patientProfileOverviewResponse.getPendingActionsCount())
                            .aligners(alignerDataList)
                            .build();
            patientProfileOverviewActionResponseList.add(patientProfileOverviewActionResponse);
        }));

        return patientProfileOverviewActionResponseList;
    }

    private int countPendingActionsByType(Aligner aligner, AlignerActionType actionType) {
        return (int) aligner.getActions().stream()
                .filter(action -> action.getType() == actionType && !action.isValidated())
                .count();
    }

    private AlignerActionData getReminderSentToPatient(Event event, Aligner aligner) {
        return AlignerActionData.builder()
                .actionType(AlignerActionType.REMINDER_SENT_TO_PATIENT)
                .performedAt(event.getCreatedAt())
                .build();
    }

    private Event isReminderSentToPatient(Long patientId, Aligner aligner) {
        var events = eventRepository.findReminderSentEventsByPatientIdAndAlignerNumber(
                patientId,
                String.valueOf(UserType.PATIENT),
                String.valueOf(EventType.REMINDER_SENT_TO_PATIENT),
                aligner.getSrNo());

        if (events.isEmpty()) {
            return null;
        }

        return events.get(0);
    }

    private AlignerActionData getAlignerChangeOverduePendingAction(Aligner aligner) {
        ZonedDateTime performedAt = aligner.getEndDate().atStartOfDay(ZoneId.systemDefault());
        return AlignerActionData.builder()
                .actionType(AlignerActionType.ALIGNER_CHANGE_OVERDUE_PENDING_ACTION)
                .performedAt(performedAt)
                .build();
    }

    private AlignerActionData getAlignerChangeOverdue(Aligner aligner) {
        ZonedDateTime performedAt = aligner.getEndDate().atStartOfDay(ZoneId.systemDefault());

        return AlignerActionData.builder()
                .performedAt(performedAt)
                .actionType(AlignerActionType.ALIGNER_CHANGE_OVERDUE)
                .build();
    }

    private List<AlignerActionData> getDeactivateTreatmentAction(AlignerJourney alignerJourney) {

        if (alignerJourney == null || alignerJourney.getTracking() == null) {
            return Collections.emptyList();
        }

        TreatmentPlan treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();

        if (treatmentPlan.getStatus() != AlignerTreatmentStatus.DEACTIVATED
                || treatmentPlan.getDeactivatedAt() == null) {
            return Collections.emptyList();
        }

        LocalDate deactivatedDate = treatmentPlan.getDeactivatedAt();
        ZonedDateTime performedAt = deactivatedDate.atStartOfDay(ZoneId.systemDefault());

        TreatmentDeactivateDetails details = new TreatmentDeactivateDetails();
        details.setDeactivatedAt(deactivatedDate);
        details.setReason(treatmentPlan.getReasonForDeactivation());
        details.setRemarks(treatmentPlan.getOtherRemarks());

        AlignerActionData deactivationAction = AlignerActionData.builder()
                .actionType(AlignerActionType.TREATMENT_DEACTIVATED)
                .performedAt(performedAt)
                .details(details)
                .build();

        AlignerActionData refinementAction = AlignerActionData.builder()
                .actionType(AlignerActionType.CREATE_REFINEMENT_REMINDER)
                .performedAt(performedAt)
                .build();

        return List.of(deactivationAction, refinementAction);
    }

    private PatientProfileOverviewResponse getPatientOverviewDetails(AlignerJourney alignerJourney) {
        var aligners = alignerJourney.getAligners();
        int pendingActionsCount = 0;
        for (Aligner aligner : aligners) {
            var actions = aligner.getActions();

            for (AlignerAction action : actions) {
                if (!action.isValidated()) {
                    pendingActionsCount++;
                }
            }
        }
        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        Reminder nextAppointment = reminderRepository.findNextUpcomingAppointment(
                alignerJourney.getPatient().getId(), ReminderPurpose.APPOINTMENT, LocalDate.now(), reminderStatuses);

        PatientProfileOverviewResponse.UpcomingAppointment upcomingAppointment = null;

        if (nextAppointment != null) {
            CustomAppointmentReminderMetadata metadata =
                    (CustomAppointmentReminderMetadata) nextAppointment.getMetadata();
            upcomingAppointment = PatientProfileOverviewResponse.UpcomingAppointment.builder()
                    .startDate(metadata.getStartDate())
                    .endDate(metadata.getEndDate())
                    .build();
        }

        var treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();
        return PatientProfileOverviewResponse.builder()
                .currentAligner(Objects.requireNonNull(alignerJourney.getCurrentAligner())
                        .getSrNo())
                .totalAligner(aligners.size())
                .overDue(calculateOverdue(alignerJourney.getCurrentAligner(), alignerJourney))
                .pendingActionsCount(pendingActionsCount)
                .treatmentPlanningLink(
                        alignerJourney.getTracking().getTreatmentPlan().getTreatmentPlanningLink())
                .upcomingAppointment(upcomingAppointment)
                .orderId(treatmentPlan.getOrderId())
                .treatmentPlanId(treatmentPlan.getId())
                .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                .treatmentPlanTagName(treatmentPlan.getTreatmentPlanTagName())
                .treatmentPlanUploadType(treatmentPlan.getTreatmentPlanUploadType())
                .patientType(alignerJourney.getPatient().getPatientType())
                .build();
    }

    private List<AlignerAction> filterAlignerActions(
            List<AlignerAction> actions, PatientProfileOverviewActionRequest.Filter filter) {
        if (filter == null || filter == PatientProfileOverviewActionRequest.Filter.ALL_ALIGNERS) {
            return actions;
        }

        return actions.stream()
                .filter(action -> switch (filter) {
                    case PENDING_UPDATES -> !action.isValidated();
                    case ISSUES_REPORTED -> action.getType() == AlignerActionType.ISSUE_REPORT;
                    case ALIGNER_CHECKINS -> action.getType() == AlignerActionType.CHECK_IN;
                    case ALIGNER_CHANGES -> action.getType() == AlignerActionType.ALIGNER_CHANGE;
                    default -> true;
                })
                .collect(Collectors.toList());
    }

    private List<AlignerActionData> getWearDaysUpdatedAction(Long patientId, Aligner aligner) {
        List<AlignerActionData> actions = new ArrayList<>();

        var events = eventRepository.findWearDaysUpdateEventsByUserAlignerJourneyAndAlignerNumber(
                patientId,
                String.valueOf(UserType.PATIENT),
                String.valueOf(EventType.WEAR_DAYS_UPDATED),
                aligner.getAlignerJourney().getId(),
                aligner.getSrNo());

        for (Event event : events) {
            WearDaysUpdateEventMetaData metadata = (WearDaysUpdateEventMetaData) event.getMetadata();

            Optional<AlignerChangeData> matchingAlignerChange = metadata.getAlignerChanges().stream()
                    .filter(change -> change.getAlignerNumber() != null
                            && change.getAlignerNumber().equals(aligner.getSrNo()))
                    .findFirst();

            if (matchingAlignerChange.isPresent()) {
                AlignerChangeData alignerChange = matchingAlignerChange.get();

                WearDaysUpdatedDetails wearDaysUpdateDetails = new WearDaysUpdatedDetails();
                wearDaysUpdateDetails.setOldAlignerEndDate(alignerChange.getOldEndDate());
                wearDaysUpdateDetails.setNewAlignerEndDate(alignerChange.getNewEndDate());

                AlignerActionData wearDaysUpdated = AlignerActionData.builder()
                        .actionType(AlignerActionType.WEAR_DAYS_UPDATED)
                        .performedAt(event.getCreatedAt())
                        .details(wearDaysUpdateDetails)
                        .build();

                actions.add(wearDaysUpdated);
            }
        }

        return actions;
    }

    private List<AlignerActionData> getForceAlignerChangeActions(Long patientId, Aligner aligner) {
        List<AlignerActionData> actions = new ArrayList<>();
        var events = eventRepository.findAlignerChangeEventsByUserAndPreviousAlignerNo(
                patientId,
                String.valueOf(UserType.PATIENT),
                String.valueOf(EventType.FORCE_ALIGNER_CHANGE),
                aligner.getSrNo(),
                aligner.getAlignerJourney().getId());

        if (!events.isEmpty()) {
            Event latestEvent = events.get(0);

            ForceAlignerChangeEventEventMetadata metadata =
                    (ForceAlignerChangeEventEventMetadata) latestEvent.getMetadata();

            ForceAlignerChangeDetails forceAlignerChangeDetails = new ForceAlignerChangeDetails();

            List<AlignerPhotoDetails> allAlignerPhotos = new ArrayList<>();

            if (metadata.getPreviousAlignerPhotos() != null) {
                allAlignerPhotos.addAll(metadata.getPreviousAlignerPhotos());
            }

            if (metadata.getNewAlignerPhotos() != null) {
                allAlignerPhotos.addAll(metadata.getNewAlignerPhotos());
            }

            if (!allAlignerPhotos.isEmpty()) {
                forceAlignerChangeDetails.setAlignerPhotos(allAlignerPhotos);
            } else {
                forceAlignerChangeDetails.setAlignerPhotos(Collections.emptyList());
            }

            AlignerActionData forceAlignerChange = AlignerActionData.builder()
                    .actionType(AlignerActionType.FORCE_ALIGNER_CHANGE)
                    .performedAt(latestEvent.getCreatedAt())
                    .details(forceAlignerChangeDetails)
                    .build();

            actions.add(forceAlignerChange);
        }

        return actions;
    }

    private boolean isManuallyAlignerChanged(Aligner aligner) {
        return AlignerChangeEventUtil.isManuallyAlignerChanged(aligner, eventRepository);
    }

    private List<AlignerActionData> getManualAlignerChange(Long patientId, Aligner aligner) {
        List<AlignerActionData> actions = new ArrayList<>();

        var events = eventRepository.findAlignerChangeEventsByDoctorAndPreviousAlignerNo(
                patientId,
                String.valueOf(UserType.PATIENT),
                String.valueOf(EventType.MANUAL_ALIGNER_CHANGE),
                aligner.getSrNo(),
                aligner.getAlignerJourney().getId());

        if (!events.isEmpty()) {

            Event latestEvent = events.get(0);
            var metadata = (ManualAlignerChangeEventEventMetadata) latestEvent.getMetadata();

            ManualAlignerDetails details = new ManualAlignerDetails();

            details.setNewAlignerPhotos(metadata.getNewAlignerPhotos());
            details.setPreviousAlignerPhotos(metadata.getPreviousAlignerPhotos());
            AlignerActionData forceAlignerChange = AlignerActionData.builder()
                    .actionType(AlignerActionType.MANUAl_ALIGNER_CHANGE)
                    .performedAt(latestEvent.getCreatedAt())
                    .details(details)
                    .build();

            actions.add(forceAlignerChange);
        }

        return actions;
    }

    private List<AlignerActionData> getPauseResumeActions(AlignerJourney alignerJourney) {
        var tracking = alignerJourney.getTracking();
        List<AlignerActionData> generatedActions = new ArrayList<>();

        var pauseEvents = eventRepository.findTreatmentPauseResumedEventsByUserAndAlignerJourney(
                alignerJourney.getPatient().getId(),
                String.valueOf(UserType.PATIENT),
                String.valueOf(EventType.TREATMENT_PAUSED),
                alignerJourney.getId());

        var resumeEvents = eventRepository.findTreatmentPauseResumedEventsByUserAndAlignerJourney(
                alignerJourney.getPatient().getId(),
                String.valueOf(UserType.PATIENT),
                String.valueOf(EventType.TREATMENT_RESUMED),
                alignerJourney.getId());

        for (Event pauseEvent : pauseEvents) {
            TreatmentPausedDetails pauseDetails = new TreatmentPausedDetails();
            pauseDetails.setReasonForPause(tracking.getReasonForPausing());

            AlignerActionData pausedTreatment = AlignerActionData.builder()
                    .actionType(AlignerActionType.TREATMENT_PAUSED)
                    .performedAt(pauseEvent.getCreatedAt())
                    .details(pauseDetails)
                    .build();

            generatedActions.add(pausedTreatment);
        }

        for (Event resumeEvent : resumeEvents) {
            TreatmentResumedDetails resumeDetails = new TreatmentResumedDetails();
            resumeDetails.setResumedDate(resumeEvent.getCreatedAt());

            AlignerActionData resumeTreatment = AlignerActionData.builder()
                    .actionType(AlignerActionType.TREATMENT_RESUMED)
                    .performedAt(resumeEvent.getCreatedAt())
                    .details(resumeDetails)
                    .build();

            generatedActions.add(resumeTreatment);
        }

        if (tracking.getStatus().equals(Status.PAUSED)
                && (resumeEvents.isEmpty()
                        || (!pauseEvents.isEmpty()
                                && pauseEvents
                                        .get(0)
                                        .getCreatedAt()
                                        .isAfter(resumeEvents.get(0).getCreatedAt())))) {

            AwaitingTreatmentResumedDetails awaitingDetails = new AwaitingTreatmentResumedDetails();
            awaitingDetails.setResumedDate(tracking.getResumeDate());

            AlignerActionData awaitingResumeTreatment = AlignerActionData.builder()
                    .actionType(AlignerActionType.AWAITING_RESUME_APPROVAL)
                    .performedAt(tracking.getUpdatedAt())
                    .details(awaitingDetails)
                    .build();

            generatedActions.add(awaitingResumeTreatment);
        }

        return generatedActions;
    }

    private List<AlignerActionData> alignerScheduledActionData(Aligner aligner) {
        List<AlignerActionData> generatedActions = new ArrayList<>();
        LocalDate today = LocalDate.now();

        if (aligner.getEndDate() != null
                && (aligner.getEndDate().equals(today) || aligner.getEndDate().isAfter(today))) {
            AlignerActionData scheduledChangeAction = AlignerActionData.builder()
                    .actionType(AlignerActionType.ALIGNER_CHANGE_SCHEDULED)
                    .performedAt(aligner.getEndDate().atStartOfDay(ZoneId.systemDefault()))
                    .build();
            generatedActions.add(scheduledChangeAction);
        }
        return generatedActions;
    }

    private List<AlignerActionData> getScheduledAlignerAction(Aligner aligner) {
        List<AlignerActionData> generatedActions = new ArrayList<>();

        Optional<AlignerAction> pendingChangeAction = aligner.getActions().stream()
                .filter(action -> action.getType() == AlignerActionType.ALIGNER_CHANGE && !action.isValidated())
                .findFirst();

        Optional<AlignerAction> pendingCheckInAction = aligner.getActions().stream()
                .filter(action -> action.getType() == AlignerActionType.CHECK_IN && !action.isValidated())
                .findFirst();

        if (pendingChangeAction.isPresent()) {
            AlignerActionData pendingApprovalAction = AlignerActionData.builder()
                    .actionType(AlignerActionType.ALIGNER_CHANGE_PENDING_APPROVAL)
                    .build();
            pendingApprovalAction.setActionId(pendingChangeAction.get().getId());

            if (pendingCheckInAction.isPresent()) {
                pendingApprovalAction.setPerformedAt(pendingCheckInAction.get().getPerformedAt());
            } else {
                pendingApprovalAction.setPerformedAt(pendingChangeAction.get().getPerformedAt());
            }

            generatedActions.add(pendingApprovalAction);
        } else if (pendingCheckInAction.isPresent()) {
            AlignerActionData pendingCheckInApprovalAction = AlignerActionData.builder()
                    .actionType(AlignerActionType.CHECK_IN_PENDING_APPROVAL)
                    .build();
            pendingCheckInApprovalAction.setActionId(pendingCheckInAction.get().getId());
            pendingCheckInApprovalAction.setPerformedAt(
                    pendingCheckInAction.get().getPerformedAt());
            generatedActions.add(pendingCheckInApprovalAction);
        }

        return generatedActions;
    }

    private boolean isAlignerChangeApproved(Aligner aligner) {
        return aligner.getActions().stream()
                .filter(action -> action.getType() == AlignerActionType.ALIGNER_CHANGE)
                .max(Comparator.comparing(AlignerAction::getPerformedAt))
                .map(AlignerAction::isValidated)
                .orElse(false);
    }

    private AlignerActionData mapAlignerActionToActionData(
            AlignerAction action, AlignerJourney alignerJourney, Aligner aligner) {
        AlignerActionData actionData = AlignerActionData.create(action.getType());
        actionData.setActionId(action.getId());
        actionData.setPerformedAt(action.getPerformedAt());

        ActionDetailsBase details = actionData.getDetails();
        details.setApproved(action.isValidated());
        details.setApprovedOn(action.getValidatedAt());

        details.setAlignerJourneyId(action.getAligner().getAlignerJourney().getId());

        AlignerActionMetadata metadata = action.getMetadata();

        switch (action.getType()) {
            case CHECK_IN:
                if (metadata instanceof AlignerCheckInMetadata checkInMetadata) {

                    var photos = alignerPhotoRepository.findAllById(checkInMetadata.getAlignerPhotoIds());
                    CheckInDetails checkInDetails = (CheckInDetails) details;
                    checkInDetails.setCategory(action.getUpdateCategory());
                    checkInDetails.setCheckInDate(action.getCreatedAt());
                    checkInDetails.setAlignerPhotos(
                            photos.stream().map(AlignerPhotoDetails::from).toList());
                }
                break;

            case ALIGNER_CHANGE:
                if (metadata instanceof AlignerChangeActionMetadata changeMetadata) {
                    var isMoveToPreviousAlignerEnable = false;
                    var nextAlignerNumber = aligner.getSrNo() + 1;

                    var nextAligner = Optional.ofNullable(aligner.getAlignerJourney())
                            .map(journey -> {
                                try {
                                    return journey.getAligner(nextAlignerNumber);
                                } catch (AlignerNotFoundException ignored) {
                                    return null;
                                }
                            })
                            .orElse(null);

                    if (alignerJourney.getCurrentAlignerNo() > 1
                            && alignerJourney.getCurrentAlignerNo() - 1 == aligner.getSrNo()) {
                        boolean noMoveBackActions = Optional.ofNullable(nextAligner)
                                .map(next -> next.getActions().stream()
                                        .noneMatch(a -> a.getType().equals(AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER)))
                                .orElse(false);

                        boolean hasUnapprovedAlignerChange = aligner.getActions().stream()
                                .anyMatch(
                                        changeAction -> changeAction.getType().equals(AlignerActionType.ALIGNER_CHANGE)
                                                && !changeAction.isValidated());

                        isMoveToPreviousAlignerEnable =
                                noMoveBackActions && hasUnapprovedAlignerChange && !isManuallyAlignerChanged(aligner);
                    }
                    AlignerChangeDetails changeDetails = (AlignerChangeDetails) details;
                    changeDetails.setChangeDate(changeMetadata.getChangeDate());
                    changeDetails.setTime(getTimeFromDate(action.getPerformedAt()));
                    changeDetails.setDueBy(Aligner.calculateOverdueForAction(action.getAligner(), action));
                    changeDetails.setAlignerStartDate(changeMetadata.getAlignerStartDate());
                    changeDetails.setAlignerEndDate(changeMetadata.getAlignerEndDate());
                    changeDetails.setMoveToPreviousAlignerEnable(isMoveToPreviousAlignerEnable);
                }
                break;

            case ISSUE_REPORT:
                if (metadata instanceof AlignerIssueActionMetadata issueMetadata) {
                    IssueReportDetails issueDetails = (IssueReportDetails) details;
                    issueDetails.setIssue(issueMetadata.getIssue());
                    issueDetails.setRemark(action.getIssueReportedRemark());
                    issueDetails.setOtherIssues(issueMetadata.getOtherIssues());
                }
                break;

            case MOVE_TO_PREVIOUS_ALIGNER:
                if (metadata instanceof MoveToPreviousAlignerActionMetadata moveToPreviousAlignerActionMetadata) {
                    MoveToPreviousAlignerDetails moveToPreviousAlignerDetails = (MoveToPreviousAlignerDetails) details;
                    moveToPreviousAlignerDetails.setNewAlignerId(moveToPreviousAlignerActionMetadata.getNewAlignerId());
                    moveToPreviousAlignerDetails.setPreviousAlignerId(
                            moveToPreviousAlignerActionMetadata.getPreviousAlignerId());
                    moveToPreviousAlignerDetails.setReasonForMoveToPreviousAligner(
                            ((MoveToPreviousAlignerActionMetadata) metadata).getMoveToPreviousAlignerReason());
                }
                break;

            case FORCE_ALIGNER_CHANGE:
                var events = eventRepository.findAlignerChangeEventsByUserAndPreviousAlignerNo(
                        action.getAligner().getAlignerJourney().getPatient().getId(),
                        String.valueOf(UserType.PATIENT),
                        String.valueOf(EventType.FORCE_ALIGNER_CHANGE),
                        action.getAligner().getSrNo(),
                        action.getAligner().getAlignerJourney().getId());

                if (!events.isEmpty()) {
                    Event latestEvent = events.get(0);

                    ForceAlignerChangeEventEventMetadata forceAlignerChangeEventEventMetadata =
                            (ForceAlignerChangeEventEventMetadata) latestEvent.getMetadata();

                    ForceAlignerChangeDetails forceAlignerChangeDetails = (ForceAlignerChangeDetails) details;

                    List<AlignerPhotoDetails> allAlignerPhotos = new ArrayList<>();

                    if (forceAlignerChangeEventEventMetadata.getPreviousAlignerPhotos() != null) {
                        allAlignerPhotos.addAll(forceAlignerChangeEventEventMetadata.getPreviousAlignerPhotos());
                    }

                    if (forceAlignerChangeEventEventMetadata.getNewAlignerPhotos() != null) {
                        allAlignerPhotos.addAll(forceAlignerChangeEventEventMetadata.getNewAlignerPhotos());
                    }

                    if (!allAlignerPhotos.isEmpty()) {
                        forceAlignerChangeDetails.setAlignerPhotos(allAlignerPhotos);
                    } else {
                        forceAlignerChangeDetails.setAlignerPhotos(Collections.emptyList());
                    }
                    forceAlignerChangeDetails.setAlignerJourneyId(
                            action.getAligner().getAlignerJourney().getId());
                }
                break;
        }

        return actionData;
    }

    private LocalTime getTimeFromDate(ZonedDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalTime() : null;
    }

    private Integer calculateOverdue(Aligner aligner, AlignerJourney alignerJourney) {
        if (aligner.getSrNo() < alignerJourney.getInitialAlignerNumber()) {
            return null;
        }
        if (aligner.getEndDate() == null) {
            return 0;
        }

        LocalDate now = LocalDate.now();
        if (aligner.getChangeDate() != null) {
            return Math.toIntExact(aligner.getEndDate().until(aligner.getChangeDate(), ChronoUnit.DAYS));
        } else {
            return (int) ChronoUnit.DAYS.between(now, aligner.getEndDate());
        }
    }

    private boolean isAlignerChanged(Aligner aligner) {
        return aligner.getActions().stream().anyMatch(action -> action.getType() == AlignerActionType.ALIGNER_CHANGE);
    }

    private int calculateDueBy(Aligner aligner) {
        if (aligner.getEndDate() == null) {
            return 0;
        }

        LocalDate now = LocalDate.now();
        return (int) ChronoUnit.DAYS.between(now, aligner.getEndDate());
    }
}
