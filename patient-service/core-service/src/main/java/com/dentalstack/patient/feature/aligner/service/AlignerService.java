package com.dentalstack.patient.feature.aligner.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerActionDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.AllAlignerActions;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.PatientActionDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.ValidateAlignerChangeRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.DailyWearTimeLogsResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AddAlignerFeedbackRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.UpdateAlignerProductionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.v2.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.TreatmentDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.enums.aligner.CreationStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.doctor.dto.DoctorPatientDetails;
import com.dentalstack.patient.feature.reminder.dto.SetDefaultReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateDefaultReminderRequest;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface AlignerService {
    AlignerJourney createAlignerJourney(
            com.dentalstack.patient.feature.aligner.dto.aligner.CreateAlignerJourneyRequest request);

    List<AlignerJourney> getAlignerJourney(
            long patientId,
            List<CreationStatus> creationStatuses,
            List<ProgressStatus> progressStatuses,
            @Nullable Long alignerJourneyId);

    AllAlignerJourneyDetails getAlignerJourneyDetails(
            long patientId,
            List<CreationStatus> creationStatuses,
            List<ProgressStatus> progressStatuses,
            @Nullable Long alignerJourneyId);

    AlignerJourney getAlignerJourney(@NotNull Long alignerJourneyId);

    AlignerJourney updateAlignerJourney(UpdateAlignerJourneyRequest request);

    AlignerJourney updateAlignerJourneyStartDate(long alignerJourneyId, @NotNull LocalDate startDate);

    AlignerJourney setDailyWearTime(
            long patientId, Long wearingDurationInSec, @Nullable LocalDate date, @Nullable Integer alignerSrNo);

    AlignerJourney setCustomReminder(SetReminderRequest request);

    AlignerJourney changeAligner(ChangeAlignerRequest request, MultipartFile[] photos);

    AllAlignerActions getAlignerActions(long alignerJourneyId);

    void approvePendingAligner(long alignerJourneyId);

    AlignerJourney getCurrentAlignerJourney(Long patientId);

    @Nullable
    Aligner getCurrentAligner(Long patientId);

    List<AlignerJourney> getAlignerJourneysByDoctor(Long doctorId);

    AlignerJourney setDefaultReminder(SetDefaultReminderRequest request);

    AlignerJourney deleteDefaultReminder(Long alignerJourneyId, Long defaultReminderId);

    AlignerJourney deleteCustomReminder(Long alignerJourneyId, Long customReminderId);

    AlignerJourney updateDefaultReminder(UpdateDefaultReminderRequest request);

    AlignerJourney updateCustomReminder(UpdateCustomReminderRequest request);

    AlignerJourney addAlignerFeedback(AddAlignerFeedbackRequest request);

    AlignerJourney discardAlignerJourney(Long alignerJourneyId);

    AlignerJourney updateAlignerJourneyByPatient(UpdateAlignerJourneyByPatientRequest request);

    void sendNotifications();

    AlignerJourney startAlignerJourney(StartAlignerJourneyRequest request);

    void createAlignerJourney(CreateAlignerJourneyRequest request);

    void finaliseAlignerJourneyTreatment(TreatmentPlan treatmentPlan, CreateAlignerJourneyRequest request);

    void scheduleReminders();

    AlignerJourney updateWearDays(UpdateWearDaysRequest request);

    AlignerJourneyDetails updateAligner(UpdateAlignerRequest request);

    void sendNotifications(Long patientId);

    AlignerJourney manualAlignerChange(AlignerChangeRequest request);

    AlignerJourney forceAlignerChange(AlignerChangeRequest request, MultipartFile[] photos);

    void processAlignerChanges();

    AlignerJourney updateAlignerProductionAndWearDays(UpdateAlignerProductionRequest request);

    AlignerJourney pauseOrResumeTreatment(TreatmentPauseAndResumeRequest request);

    TreatmentDetails getAlignerTreatmentDetails(long alignerJourneyId);

    AlignerAction validateAlignerChange(ValidateAlignerChangeRequest request);

    AlignerActionDetails getAlignerActionDetails(long alignerActionId);

    AlignerJourney completeAlignerJourney(long alignerJourneyId);

    void patientFillMissingAlignerDetails(PatientFillMissingAlignerDetails request);

    void deactivateAlignerJourney(Long treatmentPlanId, String reasonForDeactivate, String otherRemarks);

    AlignerJourney moveToPreviousAligner(MoveToPreviousAlignerRequest request);

    ForceAlignerChangeResponse getForceAlignerChangeDetails(long alignerJourneyId);

    ResumeTreatmentResponse getResumeTreatmentDetails(long patientId);

    AlignerJourneyResponse getCurrentJourneyDetails(long patientId);

    PatientActionDetails getPatientActionDetails(long alignerJourneyId);

    void patientTrackingStatusChange(PatientTrackingStatus patientTrackingStatus, long alignerJourneyId);

    List<AlignerJourneyPatientDetails> getPatientAccordingToAlignerFilter(AlignerJourneyFilterRequest request);

    List<DoctorPatientDetails> getActivePatients(Long doctorId);

    void updateAlignerProductionStatus();

    DailyWearTimeLogsResponse getDailyWearTimeLogs(
            Long patientId,
            @Min(value = 0, message = "Page number must be non-negative") int page,
            @Min(value = 1, message = "Page size must be positive")
                    @Max(value = 100, message = "Page size cannot exceed 100")
                    int size,
            LocalDate fromDate,
            LocalDate toDate);

    ConsistencyAlertDetails getConsistencyAlertDetails(Long patientId);
}
