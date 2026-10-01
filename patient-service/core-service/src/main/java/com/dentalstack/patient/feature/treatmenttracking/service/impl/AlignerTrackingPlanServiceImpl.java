package com.dentalstack.patient.feature.treatmenttracking.service.impl;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.treatmenttracking.dto.*;
import com.dentalstack.patient.feature.treatmenttracking.entity.AlignerStage;
import com.dentalstack.patient.feature.treatmenttracking.entity.AlignerTrackingPlan;
import com.dentalstack.patient.feature.treatmenttracking.enums.*;
import com.dentalstack.patient.feature.treatmenttracking.repository.AlignerStageRepository;
import com.dentalstack.patient.feature.treatmenttracking.repository.AlignerTrackingPlanRepository;
import com.dentalstack.patient.feature.treatmenttracking.service.AlignerTrackingPlanService;
import com.dentalstack.patient.feature.treatmenttracking.service.TrackingChatService;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlignerTrackingPlanServiceImpl implements AlignerTrackingPlanService {

    private final AlignerTrackingPlanRepository planRepo;
    private final AlignerStageRepository stageRepo;
    private final PatientRepository patientRepo;
    private final TrackingChatService chatService;
    private final ObjectMapper objectMapper;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public TreatmentPlanResponse createTreatmentPlan(CreateTrackingTreatmentPlanRequest request) {
        var patient = patientRepo
                .findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        int version = planRepo.countByPatientId(request.getPatientId()) + 1;

        int[] range = AlignerTrackingPlan.determineOverallRange(
                request.getUpperAlignerStartNo(), request.getUpperAlignerEndNo(),
                request.getLowerAlignerStartNo(), request.getLowerAlignerEndNo());
        int lowestSrNo = range[0];
        int highestSrNo = range[1];
        int stages = (highestSrNo >= lowestSrNo) ? (highestSrNo - lowestSrNo + 1) : 0;

        var plan = AlignerTrackingPlan.builder()
                .patient(patient)
                .doctorId(requestProfile.getDoctor().getId())
                .name(request.getName())
                .treatmentVersion(version)
                .upperAlignerStartNo(request.getUpperAlignerStartNo())
                .upperAlignerEndNo(request.getUpperAlignerEndNo())
                .lowerAlignerStartNo(request.getLowerAlignerStartNo())
                .lowerAlignerEndNo(request.getLowerAlignerEndNo())
                .stages(stages)
                .wearDaysPerAligner(request.getWearDaysPerAligner())
                .status(TreatmentPlanStatus.PENDING_APPROVAL)
                .currentAlignerNumber(request.getCurrentAlignerNumber())
                .planningLink(request.getPlanningLink())
                .iprAttachmentChart(request.getIprAttachmentChart())
                .createdByUserProfile(requestProfile)
                .build();

        plan = planRepo.save(plan);

        List<AlignerStage> stageList = buildAlignerStages(
                plan, request.getStartDate(), request.getWearDaysPerAligner(), lowestSrNo, highestSrNo);
        stageRepo.saveAll(stageList);

        postSystemEvent(patient.getId(), ChatEventType.TREATMENT_PLAN_CREATED);

        return toResponse(plan, stageList);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse updatePlanStatus(Long planId, UpdateTreatmentPlanStatusRequest req) {
        var plan = getPlan(planId);
        plan.setStatus(req.getStatus());
        planRepo.save(plan);

        ChatEventType event = req.getStatus() == TreatmentPlanStatus.APPROVED
                ? ChatEventType.TREATMENT_PLAN_APPROVED
                : ChatEventType.TREATMENT_PLAN_REVISION_REQUESTED;

        postSystemEvent(plan.getPatient().getId(), event);

        return toResponseWithStages(plan);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse extendCurrentAlignerWear(ExtendWearDaysRequest req, Long doctorId) {
        var plan = getPlan(req.getTreatmentPlanId());
        int currentNum = plan.getCurrentAlignerNumber();

        var current = stageRepo
                .findByTreatmentPlanIdAndAlignerNumber(plan.getId(), currentNum)
                .orElseThrow(() -> new RuntimeException("Current aligner not found"));

        applyExtension(current, req.getExtraDays());
        stageRepo.save(current);

        cascadeShift(plan.getId(), currentNum + 1, req.getExtraDays());

        postSystemEvent(plan.getPatient().getId(), ChatEventType.WEAR_DAYS_EXTENDED_CURRENT);

        return toResponseWithStages(plan);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse extendAllAlignersWear(ExtendWearDaysRequest req, Long doctorId) {
        var plan = getPlan(req.getTreatmentPlanId());
        int currentNum = plan.getCurrentAlignerNumber();

        List<AlignerStage> remaining = stageRepo.findFromAligner(plan.getId(), currentNum);

        int cumulativeShift = 0;
        for (int i = 0; i < remaining.size(); i++) {
            var stage = remaining.get(i);
            applyExtension(stage, req.getExtraDays());

            stage.setStartDate(stage.getStartDate().plusDays((long) i * req.getExtraDays()));
            stage.setEndDate(stage.getEndDate().plusDays((long) (i + 1) * req.getExtraDays()));
            cumulativeShift += req.getExtraDays();
        }
        stageRepo.saveAll(remaining);

        postSystemEvent(plan.getPatient().getId(), ChatEventType.WEAR_DAYS_EXTENDED_ALL);

        return toResponseWithStages(plan);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse revertWearDays(RevertWearDaysRequest req, Long doctorId) {
        var plan = getPlan(req.getTreatmentPlanId());

        var stage = stageRepo
                .findByTreatmentPlanIdAndAlignerNumber(plan.getId(), req.getAlignerNumber())
                .orElseThrow(() -> new RuntimeException("Aligner not found"));

        int reverted = stage.getExtendedDays() == null ? 0 : stage.getExtendedDays();
        if (reverted == 0) return toResponseWithStages(plan);

        stage.setEndDate(stage.getEndDate().minusDays(reverted));
        stage.setWearDays(plan.getWearDaysPerAligner());
        stage.setExtendedDays(0);
        stageRepo.save(stage);

        cascadeShift(plan.getId(), req.getAlignerNumber() + 1, -reverted);

        postSystemEvent(plan.getPatient().getId(), ChatEventType.WEAR_DAYS_REVERTED);

        return toResponseWithStages(plan);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse moveToAligner(MoveAlignerRequest req, Long doctorId) {
        var plan = getPlan(req.getTreatmentPlanId());

        stageRepo.clearCurrentAligner(plan.getId());

        List<AlignerStage> all = stageRepo.findByTreatmentPlanIdOrderByAlignerNumberAsc(plan.getId());
        for (var stage : all) {
            if (stage.getAlignerNumber() < req.getToAlignerNumber()) {
                stage.setStatus(AlignerStatus.COMPLETED);
                stage.setIsCurrentAligner(false);
            } else if (stage.getAlignerNumber().equals(req.getToAlignerNumber())) {
                stage.setStatus(AlignerStatus.ACTIVE);
                stage.setIsCurrentAligner(true);
            } else {
                stage.setStatus(AlignerStatus.UPCOMING);
                stage.setIsCurrentAligner(false);
            }
        }
        stageRepo.saveAll(all);

        plan.setCurrentAlignerNumber(req.getToAlignerNumber());
        planRepo.save(plan);

        postSystemEvent(plan.getPatient().getId(), ChatEventType.ALIGNER_STAGE_MOVED);

        return toResponseWithStages(plan);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse patientChangeAligner(Long treatmentPlanId, LocalDate changeDate, Long patientUserId) {
        var plan = getPlan(treatmentPlanId);
        int currentNum = plan.getCurrentAlignerNumber();
        int nextNum = currentNum + 1;

        int[] range = AlignerTrackingPlan.determineOverallRange(
                plan.getUpperAlignerStartNo(), plan.getUpperAlignerEndNo(),
                plan.getLowerAlignerStartNo(), plan.getLowerAlignerEndNo());
        int highestSrNo = range[1];

        if (nextNum > highestSrNo) {
            throw new RuntimeException("Already on the last aligner");
        }

        stageRepo.clearCurrentAligner(plan.getId());

        var current = stageRepo
                .findByTreatmentPlanIdAndAlignerNumber(plan.getId(), currentNum)
                .orElseThrow();
        current.setChangeDate(changeDate);
        current.setStatus(AlignerStatus.COMPLETED);
        current.setIsCurrentAligner(false);

        var next = stageRepo
                .findByTreatmentPlanIdAndAlignerNumber(plan.getId(), nextNum)
                .orElseThrow();
        next.setStatus(AlignerStatus.ACTIVE);
        next.setIsCurrentAligner(true);

        stageRepo.saveAll(List.of(current, next));

        recascadeDatesFromAligner(plan.getId(), nextNum, changeDate);

        plan.setCurrentAlignerNumber(nextNum);
        planRepo.save(plan);

        chatService.postActivity(
                plan.getPatient().getId(), SenderType.PATIENT, patientUserId, ChatEventType.ALIGNER_CHANGED);

        return toResponseWithStages(plan);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse checkIn(CheckInRequest request, Long patientUserId) {
        var plan = getPlan(request.getTreatmentPlanId());
        int alignerNum =
                request.getAlignerNumber() != null ? request.getAlignerNumber() : plan.getCurrentAlignerNumber();

        var stage = stageRepo
                .findByTreatmentPlanIdAndAlignerNumber(plan.getId(), alignerNum)
                .orElseThrow(() -> new RuntimeException("Aligner stage not found: " + alignerNum));

        stage.setCheckedIn(true);
        stageRepo.save(stage);

        chatService.postActivity(
                plan.getPatient().getId(), SenderType.PATIENT, patientUserId, ChatEventType.ALIGNER_REVIEW_SUBMITTED);

        return toResponseWithStages(plan);
    }

    @Override
    @Transactional
    public TreatmentPlanResponse reportIssue(ReportIssueRequest request, Long patientUserId) {
        var plan = getPlan(request.getTreatmentPlanId());
        int alignerNum =
                request.getAlignerNumber() != null ? request.getAlignerNumber() : plan.getCurrentAlignerNumber();

        var stage = stageRepo
                .findByTreatmentPlanIdAndAlignerNumber(plan.getId(), alignerNum)
                .orElseThrow(() -> new RuntimeException("Aligner stage not found: " + alignerNum));

        stage.setIssueReported(true);
        stageRepo.save(stage);

        chatService.postActivity(
                plan.getPatient().getId(), SenderType.PATIENT, patientUserId, ChatEventType.ISSUE_REPORTED);

        return toResponseWithStages(plan);
    }

    @Override
    public List<TreatmentPlanResponse> getPlansForPatient(Long patientId) {
        return planRepo.findByPatientIdOrderByVersionAsc(patientId).stream()
                .map(this::toResponseWithStages)
                .collect(Collectors.toList());
    }

    @Override
    public TreatmentPlanResponse getPlanById(Long planId) {
        return toResponseWithStages(getPlan(planId));
    }

    private AlignerTrackingPlan getPlan(Long planId) {
        return planRepo.findById(planId)
                .orElseThrow(() -> new RuntimeException("AlignerTrackingPlan not found: " + planId));
    }

    private List<AlignerStage> buildAlignerStages(
            AlignerTrackingPlan plan, LocalDate start, int wearDays, int lowestSrNo, int highestSrNo) {
        List<AlignerStage> result = new ArrayList<>();
        LocalDate cursor = start;
        boolean isFirst = true;
        for (int i = lowestSrNo; i <= highestSrNo; i++) {
            boolean upper = plan.isUpperAligner(i);
            boolean lower = plan.isLowerAligner(i);
            JawType jawType;
            if (upper && lower) {
                jawType = JawType.BOTH;
            } else if (upper) {
                jawType = JawType.UPPER;
            } else {
                jawType = JawType.LOWER;
            }

            LocalDate end = cursor.plusDays(wearDays);
            result.add(AlignerStage.builder()
                    .treatmentPlan(plan)
                    .alignerNumber(i)
                    .jawType(jawType)
                    .startDate(cursor)
                    .endDate(end)
                    .wearDays(wearDays)
                    .extendedDays(0)
                    .status(isFirst ? AlignerStatus.ACTIVE : AlignerStatus.UPCOMING)
                    .isCurrentAligner(isFirst)
                    .build());
            cursor = end;
            isFirst = false;
        }
        return result;
    }

    private void applyExtension(AlignerStage stage, int extraDays) {
        stage.setEndDate(stage.getEndDate().plusDays(extraDays));
        stage.setWearDays(stage.getWearDays() + extraDays);
        stage.setExtendedDays((stage.getExtendedDays() == null ? 0 : stage.getExtendedDays()) + extraDays);
    }

    private void cascadeShift(Long planId, int fromAligner, int shiftDays) {
        List<AlignerStage> downstream = stageRepo.findFromAligner(planId, fromAligner);
        for (var s : downstream) {
            s.setStartDate(s.getStartDate().plusDays(shiftDays));
            s.setEndDate(s.getEndDate().plusDays(shiftDays));
        }
        if (!downstream.isEmpty()) stageRepo.saveAll(downstream);
    }

    private void recascadeDatesFromAligner(Long planId, int fromAlignerNumber, LocalDate newStartDate) {
        List<AlignerStage> downstream = stageRepo.findFromAligner(planId, fromAlignerNumber);
        LocalDate cursor = newStartDate;
        for (var stage : downstream) {
            stage.setStartDate(cursor);
            LocalDate end = cursor.plusDays(stage.getWearDays());
            stage.setEndDate(end);
            cursor = end;
        }
        if (!downstream.isEmpty()) stageRepo.saveAll(downstream);
    }

    private void postSystemEvent(Long patientId, ChatEventType eventType) {
        chatService.postActivity(patientId, SenderType.SYSTEM, null, eventType);
    }

    private TreatmentPlanResponse toResponseWithStages(AlignerTrackingPlan plan) {
        List<AlignerStage> stages = stageRepo.findByTreatmentPlanIdOrderByAlignerNumberAsc(plan.getId());
        return toResponse(plan, stages);
    }

    private TreatmentPlanResponse toResponse(AlignerTrackingPlan plan, List<AlignerStage> stages) {
        var resp = new TreatmentPlanResponse();
        resp.setId(plan.getId());
        resp.setName(plan.getName());
        resp.setVersion(plan.getTreatmentVersion());
        resp.setUpperAlignerStartNo(plan.getUpperAlignerStartNo());
        resp.setUpperAlignerEndNo(plan.getUpperAlignerEndNo());
        resp.setLowerAlignerStartNo(plan.getLowerAlignerStartNo());
        resp.setLowerAlignerEndNo(plan.getLowerAlignerEndNo());
        resp.setStages(plan.getStages());
        resp.setWearDaysPerAligner(plan.getWearDaysPerAligner());
        resp.setStatus(plan.getStatus());
        resp.setCurrentAlignerNumber(plan.getCurrentAlignerNumber());
        resp.setPlanningLink(plan.getPlanningLink());
        resp.setIprAttachmentChart(plan.getIprAttachmentChart());
        resp.setAlignerStages(stages.stream().map(this::toStageResponse).collect(Collectors.toList()));
        return resp;
    }

    private AlignerStageResponse toStageResponse(AlignerStage s) {
        var r = new AlignerStageResponse();
        r.setId(s.getId());
        r.setAlignerNumber(s.getAlignerNumber());
        r.setJawType(s.getJawType() != null ? s.getJawType().name() : null);
        r.setStartDate(s.getStartDate());
        r.setEndDate(s.getEndDate());
        r.setChangeDate(s.getChangeDate());
        var changeStatus = s.alignerChangeStatus();
        r.setChangeStatus(changeStatus != null ? changeStatus.name() : null);
        r.setChangeOffset(s.changeOffset());
        r.setWearDays(s.getWearDays());
        r.setExtendedDays(s.getExtendedDays());
        r.setStatus(s.getStatus() != null ? s.getStatus().name() : null);
        r.setIsCurrentAligner(s.getIsCurrentAligner());
        r.setCheckedIn(s.getCheckedIn());
        r.setIssueReported(s.getIssueReported());
        return r;
    }
}
