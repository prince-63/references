package com.dentalstack.patient.feature.dashboardlabel.service;

import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.dashboardlabel.dto.DashboardLabelRequest;
import com.dentalstack.patient.feature.dashboardlabel.dto.DashboardLabelsDetails;
import com.dentalstack.patient.feature.dashboardlabel.entity.DashboardLabels;
import com.dentalstack.patient.feature.dashboardlabel.repository.DashboardLabelRepository;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardLabelServiceImpl implements DashboardLabelService {

    private final DashboardLabelRepository dashboardLabelRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final UserProfileRepository userProfileRepository;

    @Override
    public DashboardLabelsDetails saveOrUpdateDashboardLabels(DashboardLabelRequest request) {
        String homeDefault = "Home";
        String workspaceDefault = "WorkSpace";
        String customerViewDefault = "Customer view";
        String labViewDefault = "Lab view";

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow();
        var roles = userProfile.getRoles();

        if (isEnterprisePlanUser(roles)) {
            homeDefault = "Home";
            workspaceDefault = "Practice orders";
            customerViewDefault = "Customer orders";
            labViewDefault = "Lab orders";
        }

        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        DashboardLabels dashboardLabels = DashboardLabels.builder()
                .home(request.getHome() != null ? request.getHome() : homeDefault)
                .workspace(request.getWorkspace() != null ? request.getWorkspace() : workspaceDefault)
                .customerView(request.getCustomerView() != null ? request.getCustomerView() : customerViewDefault)
                .labView(request.getLabView() != null ? request.getLabView() : labViewDefault)
                .profileId(request.getProfileId())
                .build();

        dashboardLabelRepository
                .findByProfileId(request.getProfileId())
                .ifPresentOrElse(
                        existingLabel -> {
                            if (request.getHome() != null) {
                                existingLabel.setHome(request.getHome());
                            }
                            if (request.getWorkspace() != null) {
                                existingLabel.setWorkspace(request.getWorkspace());
                            }
                            if (request.getCustomerView() != null) {
                                existingLabel.setCustomerView(request.getCustomerView());
                            }
                            if (request.getLabView() != null) {
                                existingLabel.setLabView(request.getLabView());
                            }
                            dashboardLabelRepository.save(existingLabel);
                            dashboardLabels.setId(existingLabel.getId());
                            dashboardLabels.setHome(existingLabel.getHome());
                            dashboardLabels.setWorkspace(existingLabel.getWorkspace());
                            dashboardLabels.setCustomerView(existingLabel.getCustomerView());
                            dashboardLabels.setLabView(existingLabel.getLabView());
                        },
                        () -> dashboardLabelRepository.save(dashboardLabels));

        return DashboardLabelsDetails.from(dashboardLabels);
    }

    @Override
    public DashboardLabelsDetails getDashboardLabels(long profileId) {
        var labels = dashboardLabelRepository.findByProfileId(profileId);
        if (labels.isPresent()) {
            return DashboardLabelsDetails.from(labels.get());
        }
        return DashboardLabelsDetails.defaultLabels(profileId);
    }

    private boolean isEnterprisePlanUser(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
    }
}
