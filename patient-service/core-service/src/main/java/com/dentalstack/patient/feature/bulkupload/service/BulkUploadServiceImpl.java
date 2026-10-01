package com.dentalstack.patient.feature.bulkupload.service;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.ProductionLabDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.bulkupload.dto.ImportPatientRequest;
import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctor.repository.PracticeLocationRepository;
import com.dentalstack.patient.feature.invitation.dto.InvitePatientRequest;
import com.dentalstack.patient.feature.invitation.service.InvitationService;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.treatment.service.TreatmentService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.ValueRange;
import java.io.*;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
public class BulkUploadServiceImpl implements BulkUploadService {
    private static final String CREDENTIALS_FILE_PATH =
            "src/main/resources/client_secret_311364607461-58id09m8kpujprs86mgevdj46g9ske4a.apps.googleusercontent.com.json";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final List<String> SCOPES = Collections.singletonList(SheetsScopes.SPREADSHEETS_READONLY);
    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    private final InvitationService invitationService;
    private final DoctorRepository doctorRepository;
    private final PracticeLocationRepository practiceLocationRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientRepository patientRepository;
    private final TreatmentService treatmentPlanService;
    private final AtomicInteger sequence = new AtomicInteger(0);
    private static final String DATE_FORMAT = "yyyyMMddHHmmss";
    private final TreatmentPlanRepository treatmentPlanRepository;

    private synchronized String generateUniquePatientId() {

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(DATE_FORMAT));

        String prefix = "P";
        int currentSequence = sequence.getAndIncrement();

        if (sequence.get() > 9999) {
            sequence.set(0);
        }

        String sequenceStr = String.format("%04d", currentSequence);

        return prefix + timestamp + sequenceStr;
    }

    @Override
    @Transactional
    public void importDataFromSheet(ImportPatientRequest request) throws IOException, GeneralSecurityException {
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
                .setApplicationName("Your Application Name")
                .build();

        String spreadSheetId = "1HfYcq0jYMwFQNIE75PxiBBq2UoLq0s9KV7rMWJd4Ca4";
        ValueRange response = service.spreadsheets()
                .values()
                .get(spreadSheetId, "'Processed Data'!A1:Z800")
                .execute();

        List<List<Object>> values = response.getValues();
        if (values == null || values.isEmpty()) {
            log.info("No data found in spreadsheet.");
            return;
        }

        List<CompletableFuture<Void>> futures = new ArrayList<>();
        ExecutorService executorService =
                Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());

        try {
            for (int i = 1; i < values.size(); i++) {
                final int rowIndex = i;
                CompletableFuture<Void> future = CompletableFuture.runAsync(
                        () -> {
                            try {
                                processPatientRow(values.get(rowIndex), request);
                            } catch (Exception e) {
                                log.error("Error processing row {}: {}", rowIndex, e.getMessage());
                            }
                        },
                        executorService);

                futures.add(future);
            }

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        } finally {
            executorService.shutdown();
        }
    }

    private void processPatientRow(List<Object> row, ImportPatientRequest importPatientRequest) {
        try {
            if (!isValidRow(row)) {
                log.warn("Skipping invalid row: {}", row);
                return;
            }

            String practiceEmail = row.get(3).toString();
            Optional<Doctor> doctorOpt = doctorRepository.findByIdWithAllDetails(practiceEmail);

            if (doctorOpt.isEmpty()) {
                log.warn("No doctor found for email: {}", practiceEmail);
                return;
            }

            Doctor doctor = doctorOpt.get();
            Optional<UserProfile> orgUserProfile =
                    userProfileRepository.findById(importPatientRequest.getOrgProfileId());
            Optional<UserProfile> practiceUserProfile = findPracticeUserProfile(doctor);
            Optional<PracticeLocation> practiceLocation = findActivePracticeLocation(doctor);

            Optional<Patient> existingPatient =
                    patientRepository.findByCustomerMappedId(row.get(8).toString());

            if (orgUserProfile.isPresent() && practiceUserProfile.isPresent() && existingPatient.isEmpty()) {
                inviteNewPatient(
                        row, orgUserProfile.get(), practiceUserProfile.get(), practiceLocation, importPatientRequest);
            }
        } catch (Exception e) {
            log.error("Error processing patient import row: {}", row, e);
        }
    }

    private boolean isValidRow(List<Object> row) {
        return row != null
                && row.size() >= 11
                && row.get(3) != null
                && !row.get(3).toString().isEmpty()
                && row.get(8) != null;
    }

    private Optional<UserProfile> findPracticeUserProfile(Doctor doctor) {
        return doctor.getUserProfiles().isEmpty()
                ? Optional.empty()
                : userProfileRepository.findById(doctor.getUserProfiles().stream()
                        .findFirst()
                        .map(UserProfile::getId)
                        .orElseThrow());
    }

    private Optional<PracticeLocation> findActivePracticeLocation(Doctor doctor) {
        List<PracticeLocation> activeLocations = practiceLocationRepository.findByDoctorIdAndActiveTrue(doctor.getId());
        return activeLocations.isEmpty() ? Optional.empty() : Optional.of(activeLocations.get(0));
    }

    private void inviteNewPatient(
            List<Object> row,
            UserProfile orgUserProfile,
            UserProfile practiceUserProfile,
            Optional<PracticeLocation> practiceLocation,
            ImportPatientRequest request) {
        invitationService.invitePatient(InvitePatientRequest.builder()
                .firstName(row.get(0).toString())
                .lastName(row.get(1).toString())
                .city(row.get(6).toString())
                .gender(row.get(10).toString())
                .state(row.get(5).toString())
                .countryCode(CountryCode.IND)
                .country(row.get(5).toString())
                .customerMappedId(row.get(8).toString())
                .inviterUserType(UserType.DOCTOR)
                .organizationId(request.getOrgId())
                .profileId(request.getOrgProfileId())
                .practiceProfileId(practiceUserProfile.getId())
                .inviterId(orgUserProfile.getDoctor().getId())
                .practiceLocation(practiceLocation
                        .map(PracticeLocation::getPracticeLocationName)
                        .orElse(null))
                .practiceLocationId(
                        practiceLocation.map(PracticeLocation::getId).orElse(null))
                .patientUuid(generateUniquePatientId())
                .build());
    }

    private Credential getCredentials(final NetHttpTransport HTTP_TRANSPORT) throws IOException {
        InputStream in = getClass().getResourceAsStream("/" + new File(CREDENTIALS_FILE_PATH).getName());
        if (in == null) {
            throw new FileNotFoundException("Resource not found: " + CREDENTIALS_FILE_PATH);
        }
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                        HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();
        LocalServerReceiver receiver =
                new LocalServerReceiver.Builder().setPort(8888).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    @Override
    @Transactional
    public void importTreatmentPlansFromSheet(String spreadsheetId, String range)
            throws IOException, GeneralSecurityException {
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
                .setApplicationName("Your Application Name")
                .build();

        ValueRange response = service.spreadsheets()
                .values()
                .get(spreadsheetId, "'Processed Data'!A1:Z600")
                .execute();

        List<List<Object>> values = response.getValues();
        if (values == null || values.isEmpty()) {
            log.info("No data found.");
            return;
        }

        values = values.subList(1, values.size());

        int chunkSize = 20;
        int totalChunks = (values.size() + chunkSize - 1) / chunkSize;

        log.info("Starting import of {} treatments in {} chunks", values.size(), totalChunks);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            int start = chunkIndex * chunkSize;
            int end = Math.min(start + chunkSize, values.size());
            List<List<Object>> chunk = values.subList(start, end);
            final int currentChunk = chunkIndex + 1;

            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    processChunkWithRetry(chunk, successCount, failureCount);
                    log.info(
                            "Processed chunk {}/{}: Success={}, Failures={}",
                            currentChunk,
                            totalChunks,
                            successCount.get(),
                            failureCount.get());
                    Thread.sleep(500);
                } catch (Exception e) {
                    log.error("Error processing chunk {}: {}", currentChunk, e.getMessage());
                }
            });

            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenRun(() -> log.info(
                        "Import completed. Total successful={}, failed={}", successCount.get(), failureCount.get()))
                .join();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void processChunkWithRetry(
            List<List<Object>> chunk, AtomicInteger successCount, AtomicInteger failureCount) {
        for (List<Object> row : chunk) {
            int maxRetries = 3;
            int currentTry = 0;

            while (currentTry < maxRetries) {
                try {
                    String customerId = row.get(8).toString();
                    String practiceEmail = row.get(3).toString().toLowerCase();
                    long brandId = determineBrandId(practiceEmail);

                    Optional<Doctor> doctor = doctorRepository.findByIdWithAllDetails(practiceEmail);
                    if (doctor.isEmpty()) {
                        log.warn("No doctor found for email: {}", practiceEmail);
                        failureCount.incrementAndGet();
                        break;
                    }

                    Optional<Patient> patient = patientRepository.findByCustomerMappedId(customerId);
                    if (patient.isEmpty()) {
                        log.warn("No patient found for customer ID: {}", customerId);
                        failureCount.incrementAndGet();
                        break;
                    }

                    var existingPlan = treatmentPlanRepository.findByPatientId(
                            patient.get().getId());
                    if (!existingPlan.isEmpty()) {
                        log.warn("Treatment plan already exists for patient: {}", customerId);
                        failureCount.incrementAndGet();
                        break;
                    }

                    TreatmentPlanRequest treatmentPlanRequest =
                            buildTreatmentPlanRequest(row, doctor.get(), patient.get(), brandId);

                    treatmentPlanService.createOrUpdateTreatmentPlan(
                            treatmentPlanRequest, null, null, null, null, null, null, null, null, null);

                    log.info("Successfully created treatment plan for customer ID: {}", customerId);
                    successCount.incrementAndGet();
                    break;

                } catch (Exception e) {
                    currentTry++;
                    if (currentTry == maxRetries) {
                        failureCount.incrementAndGet();
                        log.error(
                                "Failed after {} retries for customer ID {}: {}",
                                maxRetries,
                                row.get(8),
                                e.getMessage());
                    } else {
                        try {
                            Thread.sleep(1000L * (long) Math.pow(2, currentTry - 1));
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            }
        }
    }

    private TreatmentPlanRequest buildTreatmentPlanRequest(
            List<Object> row, Doctor doctor, Patient patient, long brandId) {
        return TreatmentPlanRequest.builder()
                .patientId(patient.getId())
                .doctorId(doctor.getId())
                .treatmentSubType(ProductTypeName.ALIGNERS)
                .name("Treatment 1")
                .alignerTreatmentDetails(buildAlignerTreatmentDetails(row))
                .daysToWearEachAligner(14)
                .recommendedHoursToWearAligners(22)
                .status(AlignerTreatmentStatus.ACTIVE)
                .treatmentType("Clear Aligners")
                .productionLabDetails(buildProductionLabDetails(brandId))
                .treatmentPlanTagName("Smilezy treatment")
                .build();
    }

    private AlignerTreatmentDetails buildAlignerTreatmentDetails(List<Object> row) {
        Function<Object, Boolean> isEmpty =
                (obj) -> obj == null || obj.toString().trim().isEmpty();

        Function<Object, Integer> safeParseInt = (obj) -> {
            if (isEmpty.apply(obj)) {
                return null;
            }
            return Integer.parseInt(obj.toString().trim());
        };

        Function<Integer, Object> safeGet = (index) -> index < row.size() ? row.get(index) : null;

        Integer upperStart = safeParseInt.apply(safeGet.apply(19));
        Integer upperEnd = safeParseInt.apply(safeGet.apply(20));
        Integer lowerStart = safeParseInt.apply(safeGet.apply(21));
        Integer lowerEnd = safeParseInt.apply(safeGet.apply(22));

        return AlignerTreatmentDetails.builder()
                .upperJaw(
                        upperStart != null && upperEnd != null
                                ? UpperJawDetails.builder()
                                        .startsWith(upperStart)
                                        .endsWith(upperEnd)
                                        .range(IntStream.rangeClosed(upperStart, upperEnd)
                                                .boxed()
                                                .collect(Collectors.toList()))
                                        .build()
                                : null)
                .lowerJaw(
                        lowerStart != null && lowerEnd != null
                                ? LowerJawDetails.builder()
                                        .startsWith(lowerStart)
                                        .endsWith(lowerEnd)
                                        .range(IntStream.rangeClosed(lowerStart, lowerEnd)
                                                .boxed()
                                                .collect(Collectors.toList()))
                                        .build()
                                : null)
                .build();
    }

    private ProductionLabDetails buildProductionLabDetails(long brandId) {
        return ProductionLabDetails.builder()
                .productionLabId(brandId)
                .brandName("Smilezy")
                .build();
    }

    private long determineBrandId(String practiceEmail) {
        return switch (practiceEmail.toLowerCase()) {
            case "afd.parnell@gmail.com" -> 180L;
            case "afd.drury@gmail.com" -> 179L;
            case "afd.milford@gmail.com" -> 178L;
            case "afd.newlynn@gmail.com" -> 177L;
            case "abhismilezy@gmail.com" -> 181L;
            default -> 9L;
        };
    }
}
