package com.dentalstack.patient.feature.subscription.service.impl;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.subscription.entity.SubscriptionPlan;
import com.dentalstack.patient.feature.subscription.entity.SubscriptionUserMapping;
import com.dentalstack.patient.feature.subscription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.subscription.service.SubscriptionService;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.whatsapp.dto.OrgWhatsAppDetails;
import com.dentalstack.patient.feature.whatsapp.util.ResolveOrgName;
import jakarta.annotation.Nullable;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final DoctorService doctorService;
    private final DoctorDashboardService doctorDashboardService;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrderRepository orderRepository;
    private final ChatService chatService;
    private final DoctorRepository doctorRepository;

    @Nullable
    private DoctorRole getRole(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .map(name -> {
                    try {
                        return DoctorRole.valueOf(name);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    @Override
    public OrgWhatsAppDetails isWhatsAppMessagingEnabled(Long doctorId, Long userProfileId) {
        OrgWhatsAppDetails details = new OrgWhatsAppDetails();

        userProfileRepository
                .findById(userProfileId)
                .map(UserProfile::getOrganizationBrandName)
                .map(ResolveOrgName::resolveOrgName)
                .ifPresent(details::setOrgName);

        boolean isEnabled = subscriptionUserMappingRepository
                .findByDoctorIdAndUserProfileId(doctorId, userProfileId)
                .map(SubscriptionUserMapping::getSubscriptionPlan)
                .map(SubscriptionPlan::getIsWhatsAppMessagingEnabled)
                .filter(Boolean.TRUE::equals)
                .isPresent();

        details.setWhatsAppMessagingEnabled(isEnabled);

        return details;
    }

    public String formatPlanName(String originalPlanName) {
        if (originalPlanName == null) return null;

        // Capitalize first letter, lowercase rest for each word
        return Arrays.stream(originalPlanName.split("_"))
                .map(word ->
                        word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    public String formatPlanForDisplay(String planName) {
        if (planName == null) return null;

        return switch (planName.toUpperCase()) {
            case "STARTER" -> "Starter Plan";
            case "GROWTH" -> "Growth Plan";
            case "PROFESSIONAL" -> "Professional Plan";
            case "DESIGN_LAB" -> "Design lab";
            default -> planName;
        };
    }

    public String upgradePlan(String requestType, String planName) {
        String formattedPlanName = formatPlanForDisplay(planName);
        return requestType + " - " + formattedPlanName;
    }
}
