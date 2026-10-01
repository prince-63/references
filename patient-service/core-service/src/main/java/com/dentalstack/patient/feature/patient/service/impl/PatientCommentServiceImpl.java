package com.dentalstack.patient.feature.patient.service.impl;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.PATIENT_COMMENT_FOLDER_NAME;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.order.entity.OrderComments;
import com.dentalstack.patient.feature.order.repository.OrderCommentsRepository;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.PatientCommentService;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.DeleteFilesRequest;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.subcription.exception.StorageLimitExceededException;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.service.notification.WorkflowManagementNotificationService;
import com.dentalstack.patient.feature.workflow.util.CaseActivityLogger;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.exception.GenericException;
import jakarta.validation.Valid;
import java.nio.file.Paths;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class PatientCommentServiceImpl implements PatientCommentService {

    @Autowired
    @Lazy
    private OrderCommentsRepository orderCommentsRepository;

    @Autowired
    @Lazy
    private PatientRepository patientRepository;

    @Autowired
    @Lazy
    private UserProfileRepository userProfileRepository;

    @Autowired
    @Lazy
    private FilesService filesService;

    @Autowired
    @Lazy
    private SubscriptionService subscriptionService;

    @Autowired
    @Lazy
    private ChatService chatService;

    @Autowired
    @Lazy
    private TimelineService timelineService;

    @Autowired
    private WhatsAppRequestBuilder whatsAppRequestBuilder;

    @Autowired
    private WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;

    @Autowired
    private WorkflowManagementNotificationService notificationService;

    @Autowired
    private PatientTaskTrackerRepository patientTaskTrackerRepository;

    @Autowired
    private CaseActivityLogger caseActivityLogger;

    @Transactional
    @Override
    public PatientCommentResponse addComment(AddPatientCommentRequest request, MultipartFile[] files) {
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found with id: " + request.getPatientId()));

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new GenericException("User not found with id: " + request.getProfileId()));

        OrderComments comments = OrderComments.builder()
                .notes(request.getNotes())
                .patient(patient)
                .addedBy(userProfile)
                .remark(request.getRemark())
                .profileId(userProfile.getId())
                .doctorId(request.getDoctorId())
                .taskId(request.getTaskId())
                .build();
        orderCommentsRepository.save(comments);
        if (files != null && files.length > 0) {
            addFiles(userProfile, files, comments);
        }

        if (request.getTaskId() != null) {
            var inviterProfile = userProfile.getInviterProfile();
            caseActivityLogger.logInfoRequested(
                    patient, inviterProfile != null ? inviterProfile : userProfile, request.getNotes());
        }

        notificationService.commentAddedNotification(userProfile, patient, request);

        return PatientCommentResponse.from(comments);
    }

    @Transactional
    @Override
    public PatientCommentResponse addCommentV2(AddPatientCommentRequestV2 request, @Valid MultipartFile[] files) {
        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found with id: " + request.getPatientId()));

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new GenericException("User profile not found with id: " + request.getProfileId()));

        UserProfile commentAddedForProfile = null;
        if (request.getCommentAddedForProfileId() != null) {
            commentAddedForProfile = userProfileRepository
                    .findById(request.getCommentAddedForProfileId())
                    .orElseThrow(() -> new GenericException(
                            "Comment recipient profile not found with id: " + request.getCommentAddedForProfileId()));
        }

        OrderComments comments = OrderComments.builder()
                .notes(request.getNotes())
                .patient(patient)
                .addedBy(userProfile)
                .commentAddedFor(commentAddedForProfile)
                .remark(request.getRemark())
                .profileId(userProfile.getId())
                .doctorId(request.getDoctorId())
                .taskId(request.getTaskId())
                .commentType(request.getCommentType())
                .build();

        orderCommentsRepository.save(comments);

        if (files != null && files.length > 0) {
            addFiles(userProfile, files, comments);
        }

        notificationService.commentAddedNotification(userProfile, patient, convertToV1Request(request));

        return PatientCommentResponse.from(comments);
    }

    @Transactional(readOnly = true)
    @Override
    public List<PatientCommentResponse> getPatientCommentsByProfile(GetPatientCommentsByProfileRequest request) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && ownerUserProfile.getInviterProfile() != null) {
            ownerUserProfile = ownerUserProfile.getInviterProfile();
            request.setProfileId(ownerUserProfile.getId());
        }
        List<OrderComments> comments =
                orderCommentsRepository.findByPatientIdAndProfileId(request.getPatientId(), request.getProfileId());

        return comments.stream().map(PatientCommentResponse::from).collect(Collectors.toList());
    }

    private AddPatientCommentRequest convertToV1Request(AddPatientCommentRequestV2 v2Request) {
        return AddPatientCommentRequest.builder()
                .patientId(v2Request.getPatientId())
                .profileId(v2Request.getProfileId())
                .doctorId(v2Request.getDoctorId())
                .notes(v2Request.getNotes())
                .remark(v2Request.getRemark())
                .taskId(v2Request.getTaskId())
                .build();
    }

    private void addFiles(UserProfile userProfile, MultipartFile[] files, OrderComments comments) {
        createAppointmentFolders(userProfile, comments);

        var subscriptionResponse = subscriptionService.getSubSubscriptionDetails(
                userProfile.getDoctor().getId(), userProfile.getId());

        if (subscriptionResponse != null) {
            double totalStorageGb = subscriptionResponse.getTotalStorageGb();
            double usedStorageMb = subscriptionResponse.getUsedStorageGb();
            long usedStorageBytes = (long) (usedStorageMb * 1_048_576L);

            long totalFilesSizeBytes = 0;
            for (MultipartFile file : files) {
                totalFilesSizeBytes += file.getSize();
            }
            long totalStorageBytes = (long) (totalStorageGb * 1_073_741_824L);

            if (usedStorageBytes + totalFilesSizeBytes > totalStorageBytes) {
                throw new StorageLimitExceededException(userProfile.getId());
            }
        }
        var doctorId = UserId.builder()
                .userId(userProfile.getDoctor().getId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(comments.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();
        var uploadDetails = filesService.uploadFiles(
                new UploadFilesRequest(
                        Paths.get("/", PATIENT_COMMENT_FOLDER_NAME).toString(), doctorId, Set.of(doctorId, patientId)),
                files,
                false);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn("Failed to upload some files {}", uploadDetails.getUploadFiles());
        }

        Set<File> existingFiles = new HashSet<>(comments.getFiles());
        Set<File> newFiles = new HashSet<>(uploadDetails.getUploadFiles());
        newFiles.removeAll(existingFiles);

        if (!newFiles.isEmpty()) {
            comments.getFiles().addAll(newFiles);
            orderCommentsRepository.save(comments);
        }
    }

    private void createAppointmentFolders(UserProfile userProfile, OrderComments orderComments) {
        var doctorId = UserId.builder()
                .userId(userProfile.getDoctor().getId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(orderComments.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();

        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get("/", PATIENT_COMMENT_FOLDER_NAME).toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isDefaultFolder(false)
                .isPatientFolder(false)
                .build());
    }

    @Transactional
    @Override
    public PatientCommentResponse updateComment(UpdatePatientCommentRequest request, MultipartFile[] files) {
        OrderComments comments = orderCommentsRepository
                .findByIdWithUserProfile(request.getCommentId())
                .orElseThrow(() -> new GenericException("Comment not found with id: " + request.getCommentId()));

        var userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        if (request.getFileIdsToRemove() != null
                && !request.getFileIdsToRemove().isEmpty()) {
            List<File> filesToRemove = comments.getFiles().stream()
                    .filter(file -> request.getFileIdsToRemove().contains(file.getId()))
                    .toList();

            comments.getFiles().removeAll(filesToRemove);
        }

        comments.setNotes(request.getNotes());
        comments.setRemark(request.getRemark());
        comments.setProfileId(userProfile.getId());
        comments.setDoctorId(request.getDoctorId());
        comments.setCreatedAt(ZonedDateTime.now());

        orderCommentsRepository.save(comments);

        if (request.getFileIdsToRemove() != null
                && !request.getFileIdsToRemove().isEmpty()) {
            var doctorId = UserId.builder()
                    .userId(userProfile.getDoctor().getId())
                    .userType(UserType.DOCTOR)
                    .build();

            filesService.deleteFilesById(DeleteFilesRequest.builder()
                    .filesToDeleteById(request.getFileIdsToRemove())
                    .deleter(doctorId)
                    .appointmentId(0L)
                    .build());
        }

        return PatientCommentResponse.from(comments);
    }

    @Override
    @Transactional
    public void deleteComment(DeletePatientCommentRequest request) {
        var commentId = request.getCommentId();
        OrderComments comments = orderCommentsRepository
                .findById(commentId)
                .orElseThrow(() -> new GenericException("Comment not found with id: " + commentId));

        Set<Long> fileIdsToDelete =
                comments.getFiles().stream().map(File::getId).collect(Collectors.toSet());

        orderCommentsRepository.delete(comments);

        if (!fileIdsToDelete.isEmpty()) {
            var deleter = UserId.builder()
                    .userId(request.getDoctorId())
                    .userType(UserType.DOCTOR)
                    .build();

            filesService.deleteFilesById(DeleteFilesRequest.builder()
                    .filesToDeleteById(fileIdsToDelete)
                    .deleter(deleter)
                    .appointmentId(0L)
                    .build());
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<PatientCommentResponse> getPatientComments(Long patientId) {
        List<OrderComments> comments = orderCommentsRepository.findByPatientIdWithUserProfile(patientId);
        return comments.stream().map(PatientCommentResponse::from).collect(Collectors.toList());
    }
}
