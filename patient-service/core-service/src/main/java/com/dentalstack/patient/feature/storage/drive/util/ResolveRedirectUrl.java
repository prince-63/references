package com.dentalstack.patient.feature.storage.drive.util;

import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.util.ResolveOrgName;
import com.dentalstack.patient.feature.storage.drive.config.OrgNameWebUrl;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ResolveRedirectUrl {

    private final UserProfileRepository userProfileRepository;
    private final OrgNameWebUrl orgNameWebUrl;

    public String resolveUrl(Long profileId, String redirectUrl) {
        boolean isStage = redirectUrl.contains("stage");
        return isStage
                ? resolveFrontendUrl(profileId, orgNameWebUrl.getStage(), getDefaultStageUrl())
                : resolveFrontendUrl(profileId, orgNameWebUrl.getProd(), getDefaultProdUrl());
    }

    private String resolveFrontendUrl(Long profileId, java.util.Map<OrgName, String> urlMap, String defaultUrl) {
        return userProfileRepository
                .findById(profileId)
                .map(UserProfile::getOrganizationBrandName)
                .map(ResolveOrgName::resolveOrgName)
                .map(urlMap::get)
                .orElse(defaultUrl);
    }

    private String getDefaultStageUrl() {
        return "https://web.stage.dental-stack.com/";
    }

    private String getDefaultProdUrl() {
        return "https://web.dental-stack.com/";
    }
}
