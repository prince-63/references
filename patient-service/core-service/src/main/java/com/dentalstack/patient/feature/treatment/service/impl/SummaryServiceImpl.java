package com.dentalstack.patient.feature.treatment.service.impl;

import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.caseinfo.dto.GetCaseInformationRequest;
import com.dentalstack.patient.feature.caseinfo.service.CaseInformationService;
import com.dentalstack.patient.feature.patient.dto.PatientTreatmentSummary;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.payment.service.PaymentService;
import com.dentalstack.patient.feature.storage.files.dto.UserFilesDetails;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.treatment.service.SummaryService;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class SummaryServiceImpl implements SummaryService {

    private final BracesJourneyRepository bracesJourneyRepository;
    private final PatientRepository patientRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final CaseInformationService caseInformationService;
    private final FilesService filesService;
    private final PaymentService paymentService;

    @Qualifier("dbQueryExecutor")
    private final Executor dbQueryExecutor;

    @Override
    public PatientTreatmentSummary getPatientSummaryDetails(Long patientId) {
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        CompletableFuture<Optional<TreatmentPlan>> treatmentPlanFuture = CompletableFuture.supplyAsync(
                () -> treatmentPlanRepository.findActiveTreatmentPlanByPatientId(patientId), dbQueryExecutor);

        CompletableFuture<Optional<UserFilesDetails>> filesFuture = CompletableFuture.supplyAsync(
                () -> Optional.ofNullable(filesService.getFiles(
                        patient.getAddedByUserId(),
                        UserType.DOCTOR,
                        patientId,
                        UserType.PATIENT,
                        "/Images/Pre treatment photos")),
                dbQueryExecutor);

        CompletableFuture<GetCaseInformationRequest> caseInfoFuture = CompletableFuture.supplyAsync(
                () -> caseInformationService.getCaseInformation(patientId), dbQueryExecutor);

        CompletableFuture<Optional<BracesJourney>> bracesJourneyFuture = CompletableFuture.supplyAsync(
                () -> bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(
                        patientId, BracesTreatmentStage.ACTIVE),
                dbQueryExecutor);

        CompletableFuture<Optional<Treatment>> treatmentFuture = CompletableFuture.supplyAsync(
                () -> Optional.ofNullable(paymentService.getTreatment(patientId)), dbQueryExecutor);

        try {
            CompletableFuture.allOf(
                            treatmentPlanFuture, filesFuture, caseInfoFuture, bracesJourneyFuture, treatmentFuture)
                    .join();

            return PatientTreatmentSummary.from(
                    treatmentPlanFuture.get().orElse(null),
                    caseInfoFuture.get(),
                    bracesJourneyFuture.get().orElse(null),
                    patient,
                    filesFuture.get().orElse(null),
                    treatmentFuture.get().orElse(null));
        } catch (Exception e) {
            log.error("Error while fetching patient summary details", e);
            throw new RuntimeException("Failed to retrieve patient summary details", e);
        }
    }
}
