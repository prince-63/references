package com.dentalstack.patient.feature.order.service.impl;

import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.service.ManufacturingNotificationService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ManufacturingNotificationServiceImpl implements ManufacturingNotificationService {

    private final ChatService chatService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final XOrganizationNameResolver xOrganizationNameResolver;

    @Override
    public void notificationForManufacturingInTransit(Patient patient, String email, String orderId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Aligners Shipped")
                .message(String.format("Aligners for %s are in transit!", patient.getFirstName()))
                .notificationIndex(134)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForManufacturingAlignerDelivered(Patient patient, String email, String orderId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Aligners Delivered")
                .message(String.format("Aligners for %s are delivered.", patient.getFirstName()))
                .notificationIndex(135)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }
}
