package com.dentalstack.patient.feature.caseinfo.service;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.*;

import com.dentalstack.patient.feature.caseinfo.dto.CaseInformationRequest;
import com.dentalstack.patient.feature.caseinfo.dto.GetCaseInformationRequest;
import com.dentalstack.patient.feature.caseinfo.entity.CaseInformation;
import com.dentalstack.patient.feature.caseinfo.repository.CaseInformationRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.UserId;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class CaseInformationServiceImpl implements CaseInformationService {

    private final CaseInformationRepository caseInformationRepository;
    private final FilesService filesService;
    private final PatientRepository patientRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public void addCaseInformation(@NonNull CaseInformationRequest request, MultipartFile[] photos) {
        CaseInformation caseInformation;
        Long doctorId = request.getDoctorId();
        Long patientId = request.getPatientId();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        Optional<CaseInformation> currentCaseInformation =
                caseInformationRepository.findByPatientIdAndDoctorId(patientId, doctorId);
        if (currentCaseInformation.isPresent()) {
            caseInformation = currentCaseInformation.get();
            caseInformation.setMetadata(request.getMetadata());
        } else {
            caseInformation = CaseInformation.from(request, patientId, doctorId);
        }
        log.info("Adding case information for patient: {}", patientId);
        if (photos != null && photos.length > 0) {
            addFiles(photos, caseInformation, patientId);
        }
        caseInformationRepository.save(caseInformation);
    }

    private void addFiles(MultipartFile[] files, CaseInformation caseInformation, Long patineId) {
        createDefaultFolder(caseInformation, patineId);

        String fullPath =
                Paths.get(DOCUMENTS_FOLDER_NAME, CASE_INFO_FOLDER_NAME).toString();

        var doctorId = UserId.builder()
                .userId(caseInformation.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId =
                UserId.builder().userId(patineId).userType(UserType.PATIENT).build();
        var uploadDetails = filesService.uploadFiles(
                new UploadFilesRequest(fullPath, doctorId, Set.of(doctorId, patientId)), files, false);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn("Failed to upload case info files {}", uploadDetails.getUploadFiles());
        }

        Set<File> existingFiles = new HashSet<>(caseInformation.getFiles());
        Set<File> newFiles = new HashSet<>(uploadDetails.getUploadFiles());
        newFiles.removeAll(existingFiles);

        if (!newFiles.isEmpty()) {
            caseInformation.getFiles().addAll(newFiles);
            caseInformationRepository.save(caseInformation);
        }
    }

    private void createDefaultFolder(CaseInformation caseInformation, Long patineId) {
        var doctorId = UserId.builder()
                .userId(caseInformation.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId =
                UserId.builder().userId(patineId).userType(UserType.PATIENT).build();

        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get("/", DOCUMENTS_FOLDER_NAME, CASE_INFO_FOLDER_NAME)
                        .toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isDefaultFolder(true)
                .isPatientFolder(true)
                .build());
    }

    @Override
    public GetCaseInformationRequest getCaseInformation(Long patientId, Long doctorId, String productType) {
        CaseInformation caseInformation = caseInformationRepository
                .findByPatientIdAndDoctorId(patientId, doctorId)
                .orElse(null);

        if (caseInformation != null) {
            List<FileDetails> uniqueFiles = caseInformation.getFiles().stream()
                    .map(FileDetails::from)
                    .collect(Collectors.groupingBy(
                            FileDetails::getFileId,
                            Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                    .values()
                    .stream()
                    .toList();
            return GetCaseInformationRequest.builder()
                    .metadata(caseInformation.getMetadata())
                    .timestamp(caseInformation.getUpdatedAt().toLocalDateTime())
                    .files(uniqueFiles)
                    .build();
        } else {
            log.warn(String.format("Case Information not found for doctor_id %s, patient_id %s", doctorId, patientId));
        }
        return GetCaseInformationRequest.builder().metadata(null).build();
    }

    @Override
    public GetCaseInformationRequest getCaseInformation(Long patientId) {
        CaseInformation caseInformation =
                caseInformationRepository.findByPatientId(patientId).orElse(null);

        if (caseInformation != null) {
            List<FileDetails> uniqueFiles = caseInformation.getFiles().stream()
                    .map(FileDetails::from)
                    .collect(Collectors.groupingBy(
                            FileDetails::getFileId,
                            Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                    .values()
                    .stream()
                    .toList();
            return GetCaseInformationRequest.builder()
                    .metadata(caseInformation.getMetadata())
                    .timestamp(caseInformation.getUpdatedAt().toLocalDateTime())
                    .files(uniqueFiles)
                    .build();
        } else {
            log.warn(String.format("Case Information not found for patient_id %s", patientId));
        }
        return GetCaseInformationRequest.builder().metadata(null).build();
    }
}
