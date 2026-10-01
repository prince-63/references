package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUserProfileDetails {

    private Long userProfileId;
    private String displayName;

    public static ProductUserProfileDetails from(UserProfile userProfile) {
        if (userProfile == null) {
            return null;
        }

        String displayName = null;
        if (userProfile.getUser() != null) {
            displayName = userProfile.getUser().getDisplayName();
        }

        return ProductUserProfileDetails.builder()
                .userProfileId(userProfile.getId())
                .displayName(displayName)
                .build();
    }
}
