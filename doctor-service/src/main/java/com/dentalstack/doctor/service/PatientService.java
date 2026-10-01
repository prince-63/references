package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.doctor.dto.dashboard.DashboardCounts;
import com.dentalstack.doctor.dto.subscription.Subscription;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.event.EventType;
import com.dentalstack.doctor.metadata.event.EventMetadata;
import java.util.List;

public interface PatientService {
    DashboardCounts getCountsForDoctor(Long doctorId);

    void addEvent(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata);

    List<Subscription> getSubscriptionDetails(Long doctorId);

    void addEventWithoutPatient(
            Long userId,
            UserType userType,
            Long forUserId,
            UserType forUserType,
            EventType eventType,
            EventMetadata metadata,
            Long profileId);

    void createCustomerAndAddBasicPlan(ChargebeeCreateCustomerRequest request);

    void clearDashboardCache(long profileId);
}
