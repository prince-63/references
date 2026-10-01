package com.dentalstack.patient.feature.patient.util;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.FILES_FOLDER_NAME;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.caseinfo.repository.CaseInformationRepository;
import com.dentalstack.patient.feature.patient.enums.LeadTreatmentStage;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.nio.file.Paths;
import java.util.Optional;

public final class LeadTreatmentStageResolver {

    private LeadTreatmentStageResolver() {}

    public static LeadTreatmentStage determineTreatmentStage(
            Long patientId,
            Long doctorId,
            FileRepository fileRepository,
            PatientRepository patientRepository,
            CaseInformationRepository caseInformationRepository,
            TreatmentPlanRepository treatmentPlanRepository,
            BracesJourneyRepository bracesJourneyRepository) {

        String preTreatmentPath = Paths.get(rootPath(patientId, UserType.PATIENT), "/Images/Pre treatment photos")
                .toString();
        boolean isPreTreatmentPhotosPresent =
                fileRepository.existsAnyFileInPath(doctorId, UserType.DOCTOR, preTreatmentPath, Status.ACTIVE);

        String scanFilesPath = Paths.get(rootPath(patientId, UserType.PATIENT), "/3D Files/Scan files")
                .toString();
        boolean isScanFilesPresent =
                fileRepository.existsAnyFileInPath(doctorId, UserType.DOCTOR, scanFilesPath, Status.ACTIVE);

        Boolean patient = patientRepository
                .findIsGettingStartedMarkedAllAsReadByIdOptional(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var caseInfoFilled = caseInformationRepository.existsByPatientId(patientId);
        boolean isGettingStartedMarkedAllAsRead = patient != null && patient;

        Optional<TreatmentPlanSummary> treatmentPlan =
                treatmentPlanRepository.findLatestTreatmentPlanSummary(patientId);
        var bracesJourneySummary =
                bracesJourneyRepository.findLatestBracesJourneySummaryByPatientAndDoctor(patientId, doctorId);

        if (treatmentPlan.isPresent()) {
            if (treatmentPlan.get().getStatus() == AlignerTreatmentStatus.DRAFT) {
                return LeadTreatmentStage.IN_PLANNING;
            } else if (treatmentPlan.get().getStatus() == AlignerTreatmentStatus.ACTIVE) {
                return LeadTreatmentStage.ADD_TRACKING;
            }
        }

        if (bracesJourneySummary.isPresent()) {
            if (bracesJourneySummary.get().getBracesTreatmentStage() == BracesTreatmentStage.DRAFT) {
                return LeadTreatmentStage.IN_PLANNING;
            } else if (bracesJourneySummary.get().getBracesTreatmentStage() == BracesTreatmentStage.ACTIVE) {
                return LeadTreatmentStage.ADD_TRACKING;
            }
        }

        if (isGettingStartedMarkedAllAsRead || isPreTreatmentPhotosPresent && isScanFilesPresent && caseInfoFilled) {
            return LeadTreatmentStage.IN_PLANNING;
        }

        return LeadTreatmentStage.ASSESSMENT;
    }

    private static String rootPath(long userId, UserType userType) {
        return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), FILES_FOLDER_NAME)
                .toString();
    }
}
