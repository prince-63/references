package com.dentalstack.patient.feature.vsp.service.impl;

import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.*;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.notification.dto.vsp.VspFilesUploadedEmailRequest;
import com.dentalstack.patient.feature.notification.dto.vsp.VspOrderDeliveredEmailRequest;
import com.dentalstack.patient.feature.notification.dto.vsp.VspOrderShippedEmailRequest;
import com.dentalstack.patient.feature.notification.dto.vsp.VspProductionOrderCreatedEmailRequest;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.VspNotificationService;
import com.dentalstack.patient.feature.notification.service.VspPlanningEmailService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspFileUploadedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspOrderDeliveredEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspOrderShippedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspProductionOrderCreatedEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.dto.request.AddVspProductionShippingRequest;
import com.dentalstack.patient.feature.vsp.dto.request.CreateVspProductionRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspProductionRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspProductionStatusRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspProductionResponse;
import com.dentalstack.patient.feature.vsp.entity.VspOrder;
import com.dentalstack.patient.feature.vsp.entity.VspPrescription;
import com.dentalstack.patient.feature.vsp.entity.VspProduction;
import com.dentalstack.patient.feature.vsp.entity.VspProductionShipping;
import com.dentalstack.patient.feature.vsp.enums.VspProductionStatus;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.vsp.repository.VspProductionRepository;
import com.dentalstack.patient.feature.vsp.service.VspProductionService;
import com.dentalstack.patient.feature.vsp.util.VspCaseActivityLogger;
import com.dentalstack.patient.feature.vsp.util.VspPortUrlResolver;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.MoveSingleTaskRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VspProductionServiceImpl implements VspProductionService {

    private final VspProductionRepository vspProductionRepository;
    private final VspOrderRepository vspOrderRepository;
    private final FileRepository fileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final TimelineService timelineService;
    private final UserProfileRepository userProfileRepository;
    private final VspPlanningEmailService vspPlanningEmailService;
    private final PatientTaskTrackerService patientTaskTrackerService;
    private final VspCaseActivityLogger vspCaseActivityLogger;
    private final VspNotificationService vspNotificationService;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;

    @Override
    @Transactional
    public VspProductionResponse createProduction(CreateVspProductionRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        log.info("Creating VSP production for order: {}", request.getVspOrderId());

        VspOrder vspOrder = vspOrderRepository
                .findById(request.getVspOrderId())
                .orElseThrow(() -> new GenericException("VSP Order not found: " + request.getVspOrderId()));

        VspProduction production = VspProduction.builder()
                .vspOrder(vspOrder)
                .status(VspProductionStatus.ORDER_CREATED)
                .intermediateSplintQty(request.getIntermediateSplintQty())
                .finalSplintQty(request.getFinalSplintQty())
                .dentalArchesUpperQty(request.getDentalArchesUpperQty())
                .dentalArchesLowerQty(request.getDentalArchesLowerQty())
                .othersCustomQty(request.getOthersCustomQty())
                .productionNotes(request.getProductionNotes())
                .build();

        if (request.getStlFileIds() != null && !request.getStlFileIds().isEmpty()) {
            List<File> stlFiles = fileRepository.findAllById(request.getStlFileIds());
            production.setStlFiles(new ArrayList<>(stlFiles));
        }

        production = vspProductionRepository.save(production);
        log.info("VSP production created with ID: {}", production.getId());

        PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                vspOrder.getPatient().getId());

        String practiceName = pdo.getUserProfile().getPracticeName();
        String labName = pdo.getAddedByUserProfile().getLabName();

        timelineService.addEvent(
                pdo.getPatient().getId(),
                UserType.PATIENT,
                pdo.getAddedByUserProfile().getDoctor().getId(),
                UserType.DOCTOR,
                EventType.VSP_PRODUCTION_ORDER_CREATED,
                new VspProductionOrderCreatedEventMetadata(
                        pdo.getPatient().getId(), pdo.getPatient().fullName(), vspOrder.getId(), labName, practiceName),
                pdo.getAddedByUserProfile(),
                pdo.getAddedByUserProfile().getOrganization());

        VspOrder order = production.getVspOrder();
        VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
        String surgeryDate = VspPrescription.formatDate(
                latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
        String daysToSurgery = VspPrescription.calculateDays(
                latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
        String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

        VspProductionOrderCreatedEmailRequest labEmailRequest = VspProductionOrderCreatedEmailRequest.builder()
                .product(order.getServiceProduct().getProductName())
                .surgeryDate(surgeryDate)
                .orthodontist(order.getOrthodontistName())
                .productsAndQuantity(String.valueOf(production.getTotalItems()))
                .productionRemarks(request.getProductionNotes())
                .orderStatus("ORDER CREATED")
                .oralSurgeon(order.getOralSurgeonName())
                .portalUrl(VspPortUrlResolver.getPortalUrl())
                .createdOn(production.getCreatedAt().toLocalDate().toString())
                .caseStatus("PRODUCTION ORDER CREATED")
                .patientName(pdo.getPatient().fullName())
                .customerName(pdo.getUserProfile().getUser().displayName())
                .surgeryType(surgeryType)
                .daysToSurgery(daysToSurgery)
                .email(pdo.getOrgUserProfile().getUser().getEmail())
                .orgName(OrgName.ROUTETOSMILE.name())
                .build();

        vspNotificationService.notifySafely(
                "vsp-production-order-created-email",
                () -> vspPlanningEmailService.sendVspProductionOrderCreatedEmail(labEmailRequest));
        String url = String.format(
                "vsp-profile/%s/plans?order_id=%s", pdo.getPatient().getId(), order.getId());
        vspNotificationService.sendWhatsAppSafely(
                pdo.getOrgUserProfile(),
                pdo.getOrgUserProfile() != null && pdo.getOrgUserProfile().getUser() != null
                        ? pdo.getOrgUserProfile().getUser().getMobileNo()
                        : " ",
                whatsappTemplateTypeProperties != null
                                && whatsappTemplateTypeProperties.getVSP_LAB_PRODUCTION_ORDER_CREATED() != null
                        ? whatsappTemplateTypeProperties.getVSP_LAB_PRODUCTION_ORDER_CREATED()
                        : " ",
                List.of(
                        pdo.getOrgUserProfile() != null
                                        && pdo.getOrgUserProfile().getUser() != null
                                ? pdo.getOrgUserProfile().getUser().displayName()
                                : " ",
                        pdo.getUserProfile() != null && pdo.getUserProfile().getUser() != null
                                ? pdo.getUserProfile().getUser().displayName()
                                : " ",
                        pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                        surgeryDate != null ? surgeryDate : " ",
                        url != null ? url : " "));
        vspCaseActivityLogger.logProductionOrderCreated(pdo.getPatient(), userProfile);

        if (!request.getStlFileIds().isEmpty()) {
            if (pdo.getUserProfile().equals(userProfile)) {
                timelineService.addEvent(
                        pdo.getPatient().getId(),
                        UserType.PATIENT,
                        pdo.getAddedByUserProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_FILES_UPLOADED,
                        new VspFileUploadedEventMetadata(
                                pdo.getPatient().getId(), pdo.getPatient().fullName(), labName, practiceName),
                        pdo.getAddedByUserProfile(),
                        pdo.getAddedByUserProfile().getOrganization());
                vspPlanningEmailService.sendVspFilesUploadedEmail(VspFilesUploadedEmailRequest.builder()
                        .portalUrl(VspPortUrlResolver.getPortalUrl())
                        .patientName(pdo.getPatient().fullName())
                        .customerName(pdo.getUserProfile().getUser().displayName())
                        .email(pdo.getAddedByUserProfile().getUser().displayName())
                        .orgName(OrgName.ROUTETOSMILE.name())
                        .build());
                vspCaseActivityLogger.logFilesUploaded(
                        pdo.getPatient(), userProfile, request.getStlFileIds().size());
            } else {
                timelineService.addEvent(
                        pdo.getPatient().getId(),
                        UserType.PATIENT,
                        pdo.getUserProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_FILES_UPLOADED,
                        new VspFileUploadedEventMetadata(
                                pdo.getPatient().getId(), pdo.getPatient().fullName(), labName, practiceName));
                vspPlanningEmailService.sendVspFilesUploadedEmail(VspFilesUploadedEmailRequest.builder()
                        .portalUrl(VspPortUrlResolver.getPortalUrl())
                        .patientName(pdo.getPatient().fullName())
                        .customerName(pdo.getUserProfile().getUser().displayName())
                        .email(pdo.getUserProfile().getUser().getEmail())
                        .orgName(OrgName.ROUTETOSMILE.name())
                        .build());
                vspCaseActivityLogger.logFilesUploaded(
                        pdo.getPatient(), userProfile, request.getStlFileIds().size());
            }
        }

        return VspProductionResponse.from(production);
    }

    @Override
    @Transactional(readOnly = true)
    public VspProductionResponse getProduction(String productionId) {
        VspProduction production = findProductionOrThrow(productionId);
        return VspProductionResponse.from(production);
    }

    @Override
    @Transactional(readOnly = true)
    public VspProductionResponse getProductionByOrderId(String orderId) {
        VspProduction production = vspProductionRepository
                .findByVspOrderId(orderId)
                .orElseThrow(() -> new GenericException("VSP Production not found for order: " + orderId));
        return VspProductionResponse.from(production);
    }

    @Override
    @Transactional
    public VspProductionResponse updateProduction(UpdateVspProductionRequest request) {
        log.info("Updating VSP production: {}", request.getProductionId());

        VspProduction production = findProductionOrThrow(request.getProductionId());

        if (request.getIntermediateSplintQty() != null) {
            production.setIntermediateSplintQty(request.getIntermediateSplintQty());
        }
        if (request.getFinalSplintQty() != null) {
            production.setFinalSplintQty(request.getFinalSplintQty());
        }
        if (request.getDentalArchesUpperQty() != null) {
            production.setDentalArchesUpperQty(request.getDentalArchesUpperQty());
        }
        if (request.getDentalArchesLowerQty() != null) {
            production.setDentalArchesLowerQty(request.getDentalArchesLowerQty());
        }
        if (request.getOthersCustomQty() != null) {
            production.setOthersCustomQty(request.getOthersCustomQty());
        }
        if (request.getProductionNotes() != null) {
            production.setProductionNotes(request.getProductionNotes());
        }

        if (request.getStlFileIds() != null) {
            List<File> stlFiles = fileRepository.findAllById(request.getStlFileIds());
            production.setStlFiles(new ArrayList<>(stlFiles));
        }

        production = vspProductionRepository.save(production);
        return VspProductionResponse.from(production);
    }

    @Override
    @Transactional
    public VspProductionResponse updateProductionStatus(UpdateVspProductionStatusRequest request) {
        log.info("Updating VSP production status: {} → {}", request.getProductionId(), request.getStatus());

        VspProduction production = findProductionOrThrow(request.getProductionId());
        production.setStatus(request.getStatus());

        switch (request.getStatus()) {
            case PACKAGED:
                changeWorkflow(
                        production.getVspOrder().getPatient(),
                        production.getVspOrder().getAssignedToUserProfile(),
                        production.getVspOrder(),
                        PACKAGED,
                        PRODUCTION_IN_HOUSE_WORKFLOW,
                        PRODUCTION_IN_HOUSE_WORKFLOW);
                break;

            case SHIPPED:
                changeWorkflow(
                        production.getVspOrder().getPatient(),
                        production.getVspOrder().getAssignedToUserProfile(),
                        production.getVspOrder(),
                        SHIPPED,
                        PRODUCTION_IN_HOUSE_WORKFLOW,
                        PRODUCTION_IN_HOUSE_WORKFLOW);
                break;

            case DELIVERED:
                changeWorkflow(
                        production.getVspOrder().getPatient(),
                        production.getVspOrder().getAssignedToUserProfile(),
                        production.getVspOrder(),
                        DELIVERED,
                        PRODUCTION_IN_HOUSE_WORKFLOW,
                        PRODUCTION_IN_HOUSE_WORKFLOW);
                break;
        }
        production = vspProductionRepository.save(production);

        if (request.getStatus().equals(VspProductionStatus.DELIVERED)) {
            VspOrder vspOrder = production.getVspOrder();
            PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                    production.getVspOrder().getPatient().getId());
            String practiceName = pdo.getUserProfile().getPracticeName();
            String labName = pdo.getAddedByUserProfile().getLabName();

            timelineService.addEvent(
                    pdo.getPatient().getId(),
                    UserType.PATIENT,
                    pdo.getUserProfile().getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.VSP_ORDER_DELIVERED,
                    new VspOrderDeliveredEventMetadata(
                            pdo.getPatient().getId(),
                            pdo.getPatient().fullName(),
                            vspOrder.getId(),
                            labName,
                            practiceName));

            timelineService.addEvent(
                    pdo.getPatient().getId(),
                    UserType.PATIENT,
                    pdo.getAddedByUserProfile().getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.VSP_ORDER_DELIVERED,
                    new VspOrderDeliveredEventMetadata(
                            pdo.getPatient().getId(),
                            pdo.getPatient().fullName(),
                            vspOrder.getId(),
                            labName,
                            practiceName),
                    pdo.getAddedByUserProfile(),
                    pdo.getAddedByUserProfile().getOrganization());

            VspOrder order = production.getVspOrder();
            VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
            String surgeryDate = VspPrescription.formatDate(
                    latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
            String daysToSurgery = VspPrescription.calculateDays(
                    latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
            String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

            VspOrderDeliveredEmailRequest labEmailRequest = VspOrderDeliveredEmailRequest.builder()
                    .product(order.getServiceProduct().getProductName())
                    .surgeryDate(surgeryDate)
                    .orthodontist(order.getOrthodontistName())
                    .productsAndQuantity(String.valueOf(production.getTotalItems()))
                    .deliveredOn(production.getUpdatedAt().toLocalDate().toString())
                    .userEmailId(pdo.getOrgUserProfile().getUser().getEmail())
                    .orthodontist(order.getOrthodontistName())
                    .oralSurgeon(order.getOralSurgeonName())
                    .portalUrl(VspPortUrlResolver.getPortalUrl())
                    .patientName(pdo.getPatient().fullName())
                    .customerName(pdo.getUserProfile().getUser().displayName())
                    .trackingNumber(production.getShipping().getTrackingNumber())
                    .shippingAddress(order.getShippingDetails().getFormattedAddress())
                    .shippingName(order.getShippingDetails().getName())
                    .surgeryType(surgeryType)
                    .daysToSurgery(daysToSurgery)
                    .email(pdo.getOrgUserProfile().getUser().getEmail())
                    .orgName(OrgName.ROUTETOSMILE.name())
                    .build();

            VspOrderDeliveredEmailRequest customerEmailRequest = VspOrderDeliveredEmailRequest.builder()
                    .product(order.getServiceProduct().getProductName())
                    .surgeryDate(surgeryDate)
                    .orthodontist(order.getOrthodontistName())
                    .deliveredOn(production.getUpdatedAt().toLocalDate().toString())
                    .productsAndQuantity(String.valueOf(production.getTotalItems()))
                    .userEmailId(pdo.getUserProfile().getUser().getEmail())
                    .orthodontist(order.getOrthodontistName())
                    .oralSurgeon(order.getOralSurgeonName())
                    .portalUrl(VspPortUrlResolver.getPortalUrl())
                    .patientName(pdo.getPatient().fullName())
                    .customerName(pdo.getUserProfile().getUser().displayName())
                    .trackingNumber(production.getShipping().getTrackingNumber())
                    .shippingAddress(order.getShippingDetails().getFormattedAddress())
                    .shippingName(order.getShippingDetails().getName())
                    .surgeryType(surgeryType)
                    .daysToSurgery(daysToSurgery)
                    .email(pdo.getUserProfile().getUser().getEmail())
                    .orgName(OrgName.ROUTETOSMILE.name())
                    .build();

            vspPlanningEmailService.sendVspOrderDeliveredEmail(labEmailRequest);
            vspPlanningEmailService.sendVspOrderDeliveredEmail(customerEmailRequest);
            vspCaseActivityLogger.logOrderDelivered(pdo.getPatient(), pdo.getAddedByUserProfile());
        }

        return VspProductionResponse.from(production);
    }

    @Transactional
    public void changeWorkflow(
            Patient patient,
            UserProfile userProfile,
            VspOrder order,
            String status,
            String workflowName,
            String currentWorkflowName) {
        patientTaskTrackerService.moveSingleTaskForVsp(
                MoveSingleTaskRequest.builder()
                        .workflowStausName(status)
                        .workflowName(workflowName)
                        .patientId(patient.getId())
                        .profileId(userProfile.getId())
                        .currentWorkflowName(currentWorkflowName)
                        .build(),
                order);
    }

    @Override
    @Transactional
    public VspProductionResponse addShippingDetails(AddVspProductionShippingRequest request) {
        log.info("Adding shipping details to VSP production: {}", request.getProductionId());

        VspProduction production = findProductionOrThrow(request.getProductionId());

        if (production.getShipping() != null) {
            throw new GenericException("Shipping details already exist for production: " + request.getProductionId()
                    + ". Use update shipping instead.");
        }

        VspProductionShipping shipping = VspProductionShipping.builder()
                .trackingNumber(request.getTrackingNumber())
                .tentativeDate(request.getTentativeDate())
                .trackingLink(request.getTrackingLink())
                .shippingDate(request.getShippingDate())
                .vspProduction(production)
                .build();

        production.setShipping(shipping);
        production.setStatus(VspProductionStatus.SHIPPED);

        production = vspProductionRepository.save(production);

        VspOrder vspOrder = production.getVspOrder();
        PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                production.getVspOrder().getPatient().getId());
        String practiceName = pdo.getUserProfile().getPracticeName();
        String labName = pdo.getAddedByUserProfile().getLabName();

        timelineService.addEvent(
                pdo.getPatient().getId(),
                UserType.PATIENT,
                pdo.getUserProfile().getDoctor().getId(),
                UserType.DOCTOR,
                EventType.VSP_ORDER_SHIPPED,
                new VspOrderShippedEventMetadata(
                        pdo.getPatient().getId(),
                        pdo.getPatient().fullName(),
                        vspOrder.getId(),
                        labName,
                        practiceName));

        timelineService.addEvent(
                pdo.getPatient().getId(),
                UserType.PATIENT,
                pdo.getAddedByUserProfile().getDoctor().getId(),
                UserType.DOCTOR,
                EventType.VSP_ORDER_SHIPPED,
                new VspOrderShippedEventMetadata(
                        pdo.getPatient().getId(), pdo.getPatient().fullName(), vspOrder.getId(), labName, practiceName),
                pdo.getAddedByUserProfile(),
                pdo.getAddedByUserProfile().getOrganization());

        VspOrder order = production.getVspOrder();
        VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
        String surgeryDate = VspPrescription.formatDate(
                latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
        String daysToSurgery = VspPrescription.calculateDays(
                latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
        String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

        VspOrderShippedEmailRequest labEmailRequest = VspOrderShippedEmailRequest.builder()
                .product(order.getServiceProduct().getProductName())
                .surgeryDate(surgeryDate)
                .orthodontist(order.getOrthodontistName())
                .productsAndQuantity(String.valueOf(production.getTotalItems()))
                .userEmailId(pdo.getAddedByUserProfile().getUser().getEmail())
                .orthodontist(order.getOrthodontistName())
                .oralSurgeon(order.getOralSurgeonName())
                .portalUrl(VspPortUrlResolver.getPortalUrl())
                .shippedOn(
                        shipping.getShippingDate() != null
                                ? shipping.getShippingDate().toString()
                                : null)
                .patientName(pdo.getPatient().fullName())
                .customerName(pdo.getUserProfile().getUser().displayName())
                .trackingNumber(shipping.getTrackingNumber())
                .trackingLink(shipping.getTrackingLink())
                .shippingAddress(order.getShippingDetails().getFormattedAddress())
                .shippingName(order.getShippingDetails().getName())
                .surgeryType(surgeryType)
                .daysToSurgery(daysToSurgery)
                .email(pdo.getAddedByUserProfile().getUser().getEmail())
                .orgName(OrgName.ROUTETOSMILE.name())
                .build();

        VspOrderShippedEmailRequest customerEmailRequest = VspOrderShippedEmailRequest.builder()
                .product(order.getServiceProduct().getProductName())
                .surgeryDate(surgeryDate)
                .orthodontist(order.getOrthodontistName())
                .productsAndQuantity(String.valueOf(production.getTotalItems()))
                .userEmailId(pdo.getUserProfile().getUser().getEmail())
                .orthodontist(order.getOrthodontistName())
                .oralSurgeon(order.getOralSurgeonName())
                .portalUrl(VspPortUrlResolver.getPortalUrl())
                .shippedOn(
                        shipping.getShippingDate() != null
                                ? shipping.getShippingDate().toString()
                                : null)
                .patientName(pdo.getPatient().fullName())
                .customerName(pdo.getUserProfile().getUser().displayName())
                .trackingNumber(shipping.getTrackingNumber())
                .trackingLink(shipping.getTrackingLink())
                .shippingAddress(order.getShippingDetails().getFormattedAddress())
                .shippingName(order.getShippingDetails().getName())
                .surgeryType(surgeryType)
                .daysToSurgery(daysToSurgery)
                .email(pdo.getUserProfile().getUser().getEmail())
                .orgName(OrgName.ROUTETOSMILE.name())
                .build();

        vspNotificationService.notifySafely(
                "vsp-order-shipped-lab-email", () -> vspPlanningEmailService.sendVspOrderShippedEmail(labEmailRequest));
        vspNotificationService.notifySafely(
                "vsp-order-shipped-customer-email",
                () -> vspPlanningEmailService.sendVspOrderShippedEmail(customerEmailRequest));
        String url = String.format(
                "vsp-profile/%s/plans?order_id=%s", pdo.getPatient().getId(), order.getId());
        vspNotificationService.sendWhatsAppSafely(
                pdo.getOrgUserProfile(),
                pdo.getOrgUserProfile() != null && pdo.getOrgUserProfile().getUser() != null
                        ? pdo.getOrgUserProfile().getUser().getMobileNo()
                        : " ",
                whatsappTemplateTypeProperties != null
                                && whatsappTemplateTypeProperties.getVSP_LAB_ORDER_SHIPPED() != null
                        ? whatsappTemplateTypeProperties.getVSP_LAB_ORDER_SHIPPED()
                        : " ",
                List.of(
                        pdo.getOrgUserProfile() != null
                                        && pdo.getOrgUserProfile().getUser() != null
                                ? pdo.getOrgUserProfile().getUser().displayName()
                                : " ",
                        pdo.getUserProfile() != null && pdo.getUserProfile().getUser() != null
                                ? pdo.getUserProfile().getUser().displayName()
                                : " ",
                        pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                        order.getShippingDetails() != null
                                ? order.getShippingDetails().getFormattedAddress()
                                : " ",
                        shipping.getShippingDate() != null
                                ? shipping.getShippingDate().toString()
                                : " ",
                        shipping.getTrackingNumber() != null ? shipping.getTrackingNumber() : " ",
                        shipping.getTrackingLink() != null ? shipping.getTrackingLink() : " ",
                        url != null ? url : " "));

        vspNotificationService.sendWhatsAppSafely(
                pdo.getUserProfile(),
                pdo.getUserProfile() != null && pdo.getUserProfile().getUser() != null
                        ? pdo.getUserProfile().getUser().getMobileNo()
                        : " ",
                whatsappTemplateTypeProperties != null
                                && whatsappTemplateTypeProperties.getVSP_CUSTOMER_ORDER_SHIPPED() != null
                        ? whatsappTemplateTypeProperties.getVSP_CUSTOMER_ORDER_SHIPPED()
                        : " ",
                List.of(
                        pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                        order.getShippingDetails() != null
                                ? order.getShippingDetails().getFormattedAddress()
                                : " ",
                        shipping.getShippingDate() != null
                                ? shipping.getShippingDate().toString()
                                : " ",
                        shipping.getTrackingNumber() != null ? shipping.getTrackingNumber() : " ",
                        shipping.getTrackingLink() != null ? shipping.getTrackingLink() : " ",
                        url != null ? url : " "));
        vspCaseActivityLogger.logOrderShipped(pdo.getPatient(), pdo.getAddedByUserProfile());

        return VspProductionResponse.from(production);
    }

    @Override
    @Transactional
    public VspProductionResponse updateShippingDetails(AddVspProductionShippingRequest request) {
        log.info("Updating shipping details for VSP production: {}", request.getProductionId());

        VspProduction production = findProductionOrThrow(request.getProductionId());

        VspProductionShipping shipping = production.getShipping();
        if (shipping == null) {
            throw new GenericException("No shipping details found for production: " + request.getProductionId()
                    + ". Use add shipping instead.");
        }

        if (request.getTrackingNumber() != null) {
            shipping.setTrackingNumber(request.getTrackingNumber());
        }
        if (request.getTentativeDate() != null) {
            shipping.setTentativeDate(request.getTentativeDate());
        }
        if (request.getTrackingLink() != null) {
            shipping.setTrackingLink(request.getTrackingLink());
        }
        if (request.getShippingDate() != null) {
            shipping.setShippingDate(request.getShippingDate());
        }
        production = vspProductionRepository.save(production);
        return VspProductionResponse.from(production);
    }

    private VspProduction findProductionOrThrow(String productionId) {
        return vspProductionRepository
                .findById(productionId)
                .orElseThrow(() -> new GenericException("VSP Production not found: " + productionId));
    }
}
