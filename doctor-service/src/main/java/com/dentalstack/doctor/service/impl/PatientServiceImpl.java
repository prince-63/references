package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.client.PatientServiceClient;
import com.dentalstack.doctor.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.doctor.dto.dashboard.DashboardCounts;
import com.dentalstack.doctor.dto.subscription.Subscription;
import com.dentalstack.doctor.dto.timeline.AddEventRequest;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.event.EventType;
import com.dentalstack.doctor.metadata.event.EventMetadata;
import com.dentalstack.doctor.service.PatientService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientServiceClient patientServiceClient;

    @Override
    public DashboardCounts getCountsForDoctor(Long doctorId) {
        return patientServiceClient.getCountsForDoctor(doctorId);
    }

    @Override
    public void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata) {
        patientServiceClient.addEvent(
                new AddEventRequest(userId, userType, forUserId, forUserType, eventType, metadata, null));
    }

    public List<Subscription> getSubscriptionDetails(Long doctorId) {
        return patientServiceClient.getSubscriptionDetails(doctorId);
    }

    @Override
    public void addEventWithoutPatient(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata,
            Long profileId) {
        patientServiceClient.addEventWithoutPatient(
                new AddEventRequest(userId, userType, forUserId, forUserType, eventType, metadata, profileId));
    }

    @Override
    public void createCustomerAndAddBasicPlan(ChargebeeCreateCustomerRequest request) {
        patientServiceClient.createCustomerAndAddBasicPlan(request);
    }

    @Override
    public void clearDashboardCache(long profileId) {
        patientServiceClient.clearDashboardCache(profileId);
    }
}
