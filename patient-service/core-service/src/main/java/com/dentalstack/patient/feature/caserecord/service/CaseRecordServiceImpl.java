package com.dentalstack.patient.feature.caserecord.service;

import com.dentalstack.patient.feature.caserecord.dto.CaseRecordDetails;
import com.dentalstack.patient.feature.caserecord.dto.CreateCaseRecordRequest;
import com.dentalstack.patient.feature.caserecord.entity.CaseRecord;
import com.dentalstack.patient.feature.caserecord.entity.CaseRecordUserMapping;
import com.dentalstack.patient.feature.caserecord.exception.CaseRecordNotFoundException;
import com.dentalstack.patient.feature.caserecord.repository.CaseRecordRepository;
import com.dentalstack.patient.feature.caserecord.repository.CaseRecordUserMappingRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.enums.FileType;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.service.notification.WorkflowManagementNotificationService;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.feature.workflow.util.CaseActivityLogger;
import com.dentalstack.patient.global.dto.UserId;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class CaseRecordServiceImpl implements CaseRecordService {

    private final FilesService filesService;
    private final CaseRecordRepository caseRecordRepository;
    private final PatientRepository patientRepository;
    private final FileRepository fileRepository;
    private final UserProfileRepository userProfileRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final WorkflowManagementNotificationService notificationService;
    private final CaseRecordUserMappingRepository caseRecordUserMappingRepository;
    private final OrderRepository orderRepository;
    private final CaseActivityLogger caseActivityLogger;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    @Override
    @Transactional
    public CaseRecordDetails createCaseRecord(
            CreateCaseRecordRequest request,
            MultipartFile[] preTreatmentFiles,
            MultipartFile[] scanFiles,
            MultipartFile[] xRayFiles) {
        AtomicBoolean isCreatedByCustomer = new AtomicBoolean();
        CaseRecord caseRecord;
        Patient patient = null;
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        if (request.getCaseRecordId() != null) {
            caseRecord = updateCaseRecord(request, preTreatmentFiles, scanFiles, xRayFiles);
            patient = caseRecord.getPatient();
            isCreatedByCustomer.set(
                    caseRecordUserMappingRepository.isCaseRecordCreatedByCustomer(caseRecord.getId(), patient.getId()));
        } else {
            patient = patientRepository
                    .findById(request.getPatientId())
                    .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

            caseRecord = new CaseRecord();
            caseRecord.setPatient(patient);
            caseRecord.setCaseRecordName(request.getCaseRecordName());
            caseRecord.setChiefComplaint(request.getChiefComplaint());
            caseRecord.setOrderId(request.getOrderId());
            initializeFileLists(caseRecord);

            handleExistingFiles(request, caseRecord);
            uploadAndAttachFiles(preTreatmentFiles, request, caseRecord, FileType.PRE_TREATMENT);
            uploadAndAttachFiles(scanFiles, request, caseRecord, FileType.SCAN);
            uploadAndAttachFiles(xRayFiles, request, caseRecord, FileType.X_RAY);

            var savedCaseRecord = caseRecordRepository.save(caseRecord);
            mapCaseRecordToUser(savedCaseRecord, userProfile);
            if (!serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
                notificationService.recordAddedNotification(userProfile, patient, request.getOrderId());
            }
            isCreatedByCustomer.set(caseRecordUserMappingRepository.isCaseRecordCreatedByCustomer(
                    savedCaseRecord.getId(), patient.getId()));
        }

        int totalFiles = Stream.of(request.getPreTreatmentFileIds(), request.getScanFileIds(), request.getXrayFileIds())
                .filter(Objects::nonNull)
                .mapToInt(List::size)
                .sum();

        if (totalFiles > 0) {
            caseActivityLogger.logFilesUploaded(patient, userProfile, totalFiles);
        }
        Boolean isAddedByAdmin =
                caseRecordUserMappingRepository.isCaseRecordCreatedByAdmin(caseRecord.getId(), patient.getId());
        return CaseRecordDetails.from(caseRecord, isCreatedByCustomer.get(), isAddedByAdmin);
    }

    private void mapCaseRecordToUser(CaseRecord caseRecord, UserProfile userProfile) {
        caseRecordUserMappingRepository.save(CaseRecordUserMapping.builder()
                .caseRecord(caseRecord)
                .userProfile(userProfile)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public CaseRecordDetails getCaseRecordByPatientId(Long patientId) {
        var caseRecord = caseRecordRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new CaseRecordNotFoundException(patientId));
        Boolean isCreatedByCustomer =
                caseRecordUserMappingRepository.isCaseRecordCreatedByCustomer(caseRecord.getId(), patientId);
        Boolean isAddedByAdmin =
                caseRecordUserMappingRepository.isCaseRecordCreatedByAdmin(caseRecord.getId(), patientId);
        return CaseRecordDetails.from(caseRecord, isCreatedByCustomer, isAddedByAdmin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseRecordDetails> getAllCaseRecords(Long patientId, String orderId) {
        List<CaseRecordDetails> response = new ArrayList<>();
        List<CaseRecord> caseRecords;

        if (orderId != null && !orderId.isEmpty()) {
            caseRecords = caseRecordRepository.findAllByPatientIdAndOrderId(patientId, orderId);
        } else {
            caseRecords = caseRecordRepository.findAllByPatientId(patientId);
        }

        caseRecords.forEach((c) -> {
            Boolean isCreatedByCustomer =
                    caseRecordUserMappingRepository.isCaseRecordCreatedByCustomer(c.getId(), patientId);
            Boolean isAddedByAdmin = caseRecordUserMappingRepository.isCaseRecordCreatedByAdmin(c.getId(), patientId);
            response.add(CaseRecordDetails.from(c, isCreatedByCustomer, isAddedByAdmin));
        });

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CaseRecordDetails getCaseRecordById(Long caseRecordId) {
        var caseRecord = caseRecordRepository
                .findById(caseRecordId)
                .orElseThrow(() -> new CaseRecordNotFoundException(caseRecordId));
        Boolean isCreatedByCustomer = caseRecordUserMappingRepository.isCaseRecordCreatedByCustomer(
                caseRecord.getId(), caseRecord.getPatient().getId());
        Boolean isAddedByAdmin = caseRecordUserMappingRepository.isCaseRecordCreatedByAdmin(
                caseRecord.getId(), caseRecord.getPatient().getId());
        return CaseRecordDetails.from(caseRecord, isCreatedByCustomer, isAddedByAdmin);
    }

    @Override
    @Transactional
    public void deleteCaseRecord(Long caseRecordId) {
        caseRecordRepository.findById(caseRecordId).orElseThrow(() -> new CaseRecordNotFoundException(caseRecordId));
        caseRecordUserMappingRepository.deleteByCaseRecordId(caseRecordId);
        caseRecordRepository.deleteById(caseRecordId);
    }

    private CaseRecord updateCaseRecord(
            CreateCaseRecordRequest request,
            MultipartFile[] preTreatmentFiles,
            MultipartFile[] scanFiles,
            MultipartFile[] xRayFiles) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        var caseRecord = caseRecordRepository
                .findById(request.getCaseRecordId())
                .orElseThrow(() -> new CaseRecordNotFoundException(request.getCaseRecordId()));

        if (request.getChiefComplaint() != null) {
            caseRecord.setChiefComplaint(request.getChiefComplaint());
        }

        if (request.getCaseRecordName() != null) {
            caseRecord.setCaseRecordName(request.getCaseRecordName());
        }

        initializeFileLists(caseRecord);
        handleExistingFiles(request, caseRecord);

        uploadAndAttachFiles(preTreatmentFiles, request, caseRecord, FileType.PRE_TREATMENT);
        uploadAndAttachFiles(scanFiles, request, caseRecord, FileType.SCAN);
        uploadAndAttachFiles(xRayFiles, request, caseRecord, FileType.X_RAY);

        return caseRecordRepository.save(caseRecord);
    }

    private void initializeFileLists(CaseRecord caseRecord) {
        if (caseRecord.getPreTreatmentFiles() == null) caseRecord.setPreTreatmentFiles(new HashSet<>());
        if (caseRecord.getScanFiles() == null) caseRecord.setScanFiles(new HashSet<>());
        if (caseRecord.getXRaysFiles() == null) caseRecord.setXRaysFiles(new HashSet<>());
    }

    private void handleExistingFiles(CreateCaseRecordRequest request, CaseRecord caseRecord) {
        if (request.getPreTreatmentFileIds() != null
                && !request.getPreTreatmentFileIds().isEmpty()) {
            caseRecord.getPreTreatmentFiles().addAll(fileRepository.findAllById(request.getPreTreatmentFileIds()));
        }

        if (request.getScanFileIds() != null && !request.getScanFileIds().isEmpty()) {
            caseRecord.getScanFiles().addAll(fileRepository.findAllById(request.getScanFileIds()));
        }

        if (request.getXrayFileIds() != null && !request.getXrayFileIds().isEmpty()) {
            caseRecord.getXRaysFiles().addAll(fileRepository.findAllById(request.getXrayFileIds()));
        }
    }

    private void uploadAndAttachFiles(
            MultipartFile[] files, CreateCaseRecordRequest request, CaseRecord caseRecord, FileType fileType) {

        if (files == null || files.length == 0) return;

        createFolderIfNeeded(request, fileType);

        String folderPath = Paths.get(
                        FilesService.IMAGE_FOLDER_NAME, fileType.name().toLowerCase())
                .toString();
        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        var uploadDetails = filesService.uploadFiles(
                new UploadFilesRequest(folderPath, doctorId, Set.of(doctorId, patientId)), files, false);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn("Failed to upload some files: {}", uploadDetails.getFailedToUpload());
        }

        switch (fileType) {
            case X_RAY -> caseRecord.getXRaysFiles().addAll(uploadDetails.getUploadFiles());
            case SCAN -> caseRecord.getScanFiles().addAll(uploadDetails.getUploadFiles());
            case PRE_TREATMENT -> caseRecord.getPreTreatmentFiles().addAll(uploadDetails.getUploadFiles());
        }
    }

    private void createFolderIfNeeded(CreateCaseRecordRequest request, FileType fileType) {
        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get(
                                "/",
                                FilesService.IMAGE_FOLDER_NAME,
                                fileType.name().toLowerCase())
                        .toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isDefaultFolder(false)
                .isPatientFolder(false)
                .build());
    }
}
