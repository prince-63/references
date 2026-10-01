package com.dentalstack.patient.feature.order.service.impl;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.DOCUMENTS_FOLDER_NAME;
import static com.dentalstack.patient.feature.storage.files.service.FilesService.IMAGE_FOLDER_NAME;
import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.PRODUCTION_IN_HOUSE_WORKFLOW;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerDetails;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.order.dto.*;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.exception.ManufacturingNotFoundException;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.order.service.ManufacturingService;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.exception.TreatmentPlanNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.feature.workflow.product.entity.LastUsedServiceProduct;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.repository.LastUsedServiceProductRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.exception.GenericException;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class ManufacturingServiceImpl implements ManufacturingService {
    private final ManufacturingRepository manufacturingRepository;

    private final TreatmentPlanRepository treatmentPlanRepository;
    private final FilesService filesService;
    private final UserProfileRepository userProfileRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final ReminderRepository reminderRepository;
    private final ChatService chatService;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final LastUsedServiceProductRepository lastUsedServiceProductRepository;
    private final PatientTaskTrackerService patientTaskTrackerService;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final ServiceProductRepository serviceProductRepository;
    private final WhatsAppUtilities whatsAppUtilities;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;

    @Override
    @Transactional
    public ManufacturingResponse createManufacturing(CreateManufacturingRequest request) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var treatmentPlan = treatmentPlanRepository
                .findByIdWithOrderAndBatches(request.getTreatmentPlanId())
                .orElseThrow(TreatmentPlanNotFoundException::new);

        int batchNumber;
        if (treatmentPlan.getManufacturingBatches() == null) {
            batchNumber = 1;
            treatmentPlan.setManufacturingBatches(new ArrayList<>());
        } else {
            batchNumber = treatmentPlan.getManufacturingBatches().size() + 1;
        }

        ServiceProduct serviceProduct = null;
        if (request.getServiceProductId() != null) {
            serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new GenericException(
                            "Service Product not found with id: " + request.getServiceProductId()));
        }
        var manufacturingBatch = ManufacturingBatch.createManufacturingBatch(
                treatmentPlan, request, userProfile, batchNumber, serviceProduct);

        treatmentPlan.getManufacturingBatches().add(manufacturingBatch);
        if (request.getServiceProductId() != null) {
            Optional<LastUsedServiceProduct> existingRecord =
                    lastUsedServiceProductRepository.findByUserProfileId(userProfile.getId());

            if (existingRecord.isPresent()) {
                LastUsedServiceProduct lastUsed = existingRecord.get();
                if (!Objects.equals(lastUsed.getProductId(), request.getServiceProductId())) {
                    lastUsed.setProductId(request.getServiceProductId());
                }
                lastUsedServiceProductRepository.save(lastUsed);
            } else {
                LastUsedServiceProduct newLastUsed = LastUsedServiceProduct.builder()
                        .productId(request.getServiceProductId())
                        .userProfileId(userProfile.getId())
                        .build();
                lastUsedServiceProductRepository.save(newLastUsed);
            }
        }
        UserProfile outsourceProfile = null;
        if (request.getOutsourceLabProfileId() != null) {
            outsourceProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getOutsourceLabProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getOutsourceLabProfileId()));

            treatmentPlan.setOutsourcedTo(outsourceProfile);
            manufacturingBatch.setOutsourcedTo(outsourceProfile);

        } else if (treatmentPlan.getOutsourcedTo() == null) {
            treatmentPlan.setOutsourcedTo(userProfile);
            manufacturingBatch.setOutsourcedTo(userProfile);
        } else {
            manufacturingBatch.setOutsourcedTo(treatmentPlan.getOutsourcedTo());
        }

        ManufacturingBatch savedBatch = manufacturingRepository.save(manufacturingBatch);
        treatmentPlanRepository.save(treatmentPlan);

        if (request.getIsNextBatch() != null && request.getIsNextBatch()) {
            PatientTaskTracker parentTask = null;
            if (userProfile.isInternalUser()) {
                if (userProfile.getInviterProfile() != null) {
                    var inviterProfile = userProfile.getInviterProfile();
                    parentTask = patientTaskTrackerService.createNextManufacturingTask(
                            inviterProfile,
                            savedBatch,
                            request,
                            TaskType.IN_HOUSE_MANUFACTURING,
                            userProfile,
                            null,
                            serviceProduct);
                }
            } else {
                parentTask = patientTaskTrackerService.createNextManufacturingTask(
                        userProfile,
                        savedBatch,
                        request,
                        TaskType.IN_HOUSE_MANUFACTURING,
                        userProfile,
                        null,
                        serviceProduct);
            }
            var patient = patientDoctorOrganizationRepository
                    .findPatientDoctorOrganizationsWithPatientByPatientId(request.getPatientId())
                    .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

            if (!(Objects.equals(patient.getUserProfile().getId(), userProfile.getId())) && userProfile.isOwner()) {
                var customerProfile = patient.getUserProfile();
                patientTaskTrackerService.createNextManufacturingTask(
                        customerProfile,
                        savedBatch,
                        request,
                        TaskType.OUTSOURCED_MANUFACTURING,
                        customerProfile,
                        parentTask,
                        serviceProduct);
            } else {
                if (outsourceProfile != null && userProfile.isConsultingOrthodontist()) {
                    patientTaskTrackerService.createNextManufacturingTask(
                            outsourceProfile,
                            savedBatch,
                            request,
                            TaskType.OUTSOURCED_MANUFACTURING,
                            outsourceProfile,
                            parentTask,
                            serviceProduct);
                }
            }
        }
        return ManufacturingResponse.createManufacturingResponse(savedBatch);
    }

    @Override
    @Transactional
    public ProcessedAndUnprocessedManufacturingResponse getManufacturingList(GetManufacturingRequest request) {
        var patientId = request.getPatientId();
        var treatmentPlanId = request.getTreatmentPlanId();
        var orderId = request.getOrderId();

        List<ManufacturingBatch> manufacturingBatches;

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
        }

        if (treatmentPlanId != null) {
            Long profileIdToUse = request.getProfileId();

            if (userProfile.isDefaultInternalUser()
                    && userProfile.getInviterProfile() != null
                    && patientTaskTrackerRepository.existsByProfileAndWorkflow(
                            request.getProfileId(), PRODUCTION_IN_HOUSE_WORKFLOW)) {
                profileIdToUse = userProfile.getInviterProfile().getId();
            }

            manufacturingBatches =
                    manufacturingRepository.findByTreatmentPlanIdAndUserProfileId(treatmentPlanId, profileIdToUse);
        } else if (orderId != null) {
            manufacturingBatches = manufacturingRepository.findByOrderId(orderId);
        } else {
            manufacturingBatches = manufacturingRepository.findByPatientId(patientId);
        }

        ManufacturingBatch latestBatch = manufacturingBatches.stream()
                .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                .orElse(null);

        UnprocessedAlignerDetails unprocessedManufacturing;
        AlignerInfo totalAligner;
        AlignerInfo unprocessedAligner;

        if (latestBatch != null) {
            TreatmentPlan treatmentPlan = latestBatch.getTreatmentPlan();

            int remainingAlignerStartNumber = ManufacturingBatch.getRemainingAlignerStartNumber(latestBatch);
            LocalDate unprocessedAlignerDueDate = alignerJourneyRepository
                    .findAlignerEndDateByPatientIdAndSrNo(patientId, remainingAlignerStartNumber)
                    .orElse(null);

            Reminder latestReminder = reminderRepository
                    .findLatestUnprocessedAlignerReminderByTreatmentPlanId(treatmentPlan.getId())
                    .orElse(null);

            totalAligner = TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan);

            AlignerInfo totalAligners = TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan);
            unprocessedAligner = ManufacturingBatch.calculatePendingAligners(totalAligners, manufacturingBatches);
            unprocessedManufacturing = UnprocessedAlignerDetails.from(
                    unprocessedAligner, unprocessedAlignerDueDate, latestReminder, treatmentPlan);
        } else {
            var treatmentPlan = treatmentPlanRepository
                    .findByIdWithOrderAndBatches(request.getTreatmentPlanId())
                    .orElseThrow(() -> new TreatmentPlanNotFoundException(request.getTreatmentPlanId()));

            Integer currentAligner =
                    alignerJourneyRepository.getCurrentAlignerNo(patientId).orElse(null);

            totalAligner = TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan);

            unprocessedAligner = ManufacturingBatch.calculatePendingAlignersWithCurrentAligner(
                    totalAligner, manufacturingBatches, currentAligner);
            unprocessedManufacturing = UnprocessedAlignerDetails.from(unprocessedAligner, null, null, treatmentPlan);
        }

        AlignerInfo deliveredAligners = ManufacturingBatch.calculateDeliveredAligners(manufacturingBatches);

        int totalAligners = (latestBatch != null)
                ? (latestBatch.getStatus().equals(ManufacturingStatus.DELIVERED) ? 0 : latestBatch.getTotalAligners())
                : 0;
        List<ManufacturingResponse> manufacturingResponses = manufacturingBatches.stream()
                .map(batch -> ManufacturingResponse.createManufacturingResponse(
                        batch,
                        totalAligners,
                        unprocessedAligner.getCount(),
                        deliveredAligners.getCount(),
                        totalAligner != null ? totalAligner.getCount() : 0))
                .collect(Collectors.toList());

        return ProcessedAndUnprocessedManufacturingResponse.builder()
                .unprocessedManufacturing(unprocessedManufacturing)
                .processedManufacturing(manufacturingResponses)
                .build();
    }

    @Override
    @Transactional
    public ManufacturingResponse getManufacturingDetails(Long manufacturingId) {
        ManufacturingBatch manufacturingBatch = manufacturingRepository
                .getManufacturingByIdWithServiceProduct(manufacturingId)
                .orElseThrow(() -> new ManufacturingNotFoundException(manufacturingId));

        return ManufacturingResponse.createManufacturingResponseService(manufacturingBatch);
    }

    @Override
    @Transactional
    public ManufacturingResponse updateManufacturing(UpdateManufacturingRequest request) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        ManufacturingBatch batch = manufacturingRepository
                .getManufacturingWithOwnerAndTargetProfile(request.getManufacturingId())
                .orElseThrow(() -> new ManufacturingNotFoundException(request.getManufacturingId()));

        var practiceProfile = batch.getManufacturingTargetProfile();
        var patient = batch.getPatient();
        var orderId = batch.getOrder() != null ? batch.getOrder().getId() : null;
        updateBatchFields(batch, request);

        if (request.getStatus() != null
                && request.getStatus().equals(ManufacturingStatus.DELIVERED)
                && userProfile.getProfileType().equals(ProfileType.OWNER)) {}

        return ManufacturingResponse.createManufacturingResponse(manufacturingRepository.save(batch));
    }

    @Override
    @Transactional
    public ManufacturingResponse updateShippingDetails(
            UpdateManufacturingShippingRequest request, MultipartFile[] documents) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        ManufacturingBatch manufacturingBatch = manufacturingRepository
                .getManufacturingWithOwnerAndTargetProfile(request.getManufacturingId())
                .orElseThrow(() -> new ManufacturingNotFoundException(request.getManufacturingId()));
        var patient = manufacturingBatch.getPatient();

        var practiceProfile = manufacturingBatch.getManufacturingTargetProfile();

        if (request.getStatus() != null
                && request.getStatus().equals(ManufacturingStatus.SHIPPED)
                && userProfile.getProfileType().equals(ProfileType.OWNER)
                && manufacturingBatch.getOrder() != null) {

            chatService.shippingDetailsAdded(EmailSendReq.builder()
                    .email(practiceProfile.getUser().getEmail())
                    .patientName(patient.fullName())
                    .trackingLink(
                            request.getTrackingLink() != null
                                    ? request.getTrackingLink()
                                    : manufacturingBatch.getTrackingLink())
                    .trackingNumber(
                            request.getTrackingNumber() != null
                                    ? request.getTrackingNumber()
                                    : manufacturingBatch.getTrackingNumber())
                    .tentativeDeliveryDate(request.getTentativeDeliveryDate())
                    .orderId(manufacturingBatch.getOrder().getId())
                    .practiceName(userProfile.getUser().displayName())
                    .orderSenderEmail(practiceProfile.getUser().getEmail())
                    .orderSenderName(practiceProfile.getUser().displayName())
                    .build());
        }

        if (whatsAppUtilities.isAdmin(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    request.getPatientId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            numbers.forEach(no -> {
                String url = "/profile" + patient.getId() + "/production";
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getALIGNERS_SHIPPED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    request.getPatientId(), List.of(MessageSendTo.ADMIN, MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            numbers.forEach(no -> {
                String url = "/profile" + patient.getId() + "/production";
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getALIGNERS_SHIPPED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isProductionUser(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    request.getPatientId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            numbers.forEach(no -> {
                String url = "/profile" + patient.getId() + "/production";
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getALIGNERS_SHIPPED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        updateBatchFields(manufacturingBatch, request);
        if (documents != null && documents.length > 0) {
            addFiles(documents, request, manufacturingBatch);
        }

        var savedManufacturingBatch = manufacturingRepository.save(manufacturingBatch);
        return ManufacturingResponse.createManufacturingResponse(savedManufacturingBatch);
    }

    private void addFiles(
            MultipartFile[] files, UpdateManufacturingShippingRequest request, ManufacturingBatch manufacturingBatch) {
        createDefaultFolder(request);
        String fullPath = Paths.get(IMAGE_FOLDER_NAME, DOCUMENTS_FOLDER_NAME).toString();

        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();
        var uploadDetails = filesService.uploadFiles(
                new UploadFilesRequest(fullPath, doctorId, Set.of(doctorId, patientId)), files, false);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn("Failed to upload some files {}", uploadDetails.getUploadFiles());
        }

        Set<File> existingFiles = new HashSet<>(manufacturingBatch.getFiles());
        Set<File> newFiles = new HashSet<>(uploadDetails.getUploadFiles());
        newFiles.removeAll(existingFiles);

        if (!newFiles.isEmpty()) {
            manufacturingBatch.getFiles().addAll(newFiles);
            manufacturingRepository.save(manufacturingBatch);
        }
    }

    private void createDefaultFolder(UpdateManufacturingShippingRequest request) {
        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get("/", IMAGE_FOLDER_NAME, DOCUMENTS_FOLDER_NAME).toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isDefaultFolder(false)
                .isPatientFolder(false)
                .build());
    }

    private void updateBatchFields(ManufacturingBatch batch, UpdateManufacturingRequest request) {
        Optional.ofNullable(request.getStatus()).ifPresent(batch::setStatus);
        Optional.ofNullable(request.getIsCurrent()).ifPresent(batch::setIsCurrent);
        Optional.ofNullable(request.getTrackingNumber()).ifPresent(batch::setTrackingNumber);
        Optional.ofNullable(request.getTrackingLink()).ifPresent(batch::setTrackingLink);

        Optional.ofNullable(request.getShippingDate()).ifPresent(batch::setShippingDate);
        Optional.ofNullable(request.getTentativeDeliveryDate()).ifPresent(batch::setTentativeDeliveryDate);
        Optional.ofNullable(request.getDeliveryDate()).ifPresent(batch::setDeliveryDate);
        Optional.ofNullable(request.getCompletionDate()).ifPresent(batch::setCompletionDate);

        Optional.ofNullable(request.getUpperAlignerStart()).ifPresent(batch::setUpperAlignerStart);
        Optional.ofNullable(request.getUpperAlignerEnd()).ifPresent(batch::setUpperAlignerEnd);
        Optional.ofNullable(request.getLowerAlignerStart()).ifPresent(batch::setLowerAlignerStart);
        Optional.ofNullable(request.getLowerAlignerEnd()).ifPresent(batch::setLowerAlignerEnd);
        Optional.ofNullable(request.getInstructions()).ifPresent(batch::setInstructions);

        if (request.getIsAlignersUpdated() != null && request.getIsAlignersUpdated()) {
            batch.setUpperAlignerStart(request.getUpperAlignerStart());
            batch.setUpperAlignerEnd(request.getUpperAlignerEnd());
            batch.setLowerAlignerStart(request.getLowerAlignerStart());
            batch.setLowerAlignerEnd(request.getLowerAlignerEnd());
        }
        Optional.ofNullable(request.getTotalAligners()).ifPresent(batch::setTotalAligners);
        Optional.ofNullable(request.getStartDate()).ifPresent(batch::setStartDate);
        Optional.ofNullable(request.getIsShowMarkAsReceived()).ifPresent(batch::setIsShowMarkAsReceived);
        Optional.ofNullable(request.getBatchType()).ifPresent(batch::setBatchType);
    }

    private void updateBatchFields(ManufacturingBatch batch, UpdateManufacturingShippingRequest request) {
        Optional.ofNullable(request.getStatus()).ifPresent(batch::setStatus);
        Optional.ofNullable(request.getTrackingNumber()).ifPresent(batch::setTrackingNumber);
        Optional.ofNullable(request.getTrackingLink()).ifPresent(batch::setTrackingLink);
        Optional.ofNullable(request.getShippingDate()).ifPresent(batch::setShippingDate);
        Optional.ofNullable(request.getTentativeDeliveryDate()).ifPresent(batch::setTentativeDeliveryDate);
        Optional.ofNullable(request.getShippingAddedOn()).ifPresent(batch::setShippingAddedOn);
    }
}
