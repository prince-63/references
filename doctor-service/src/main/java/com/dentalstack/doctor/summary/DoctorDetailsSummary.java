package com.dentalstack.doctor.summary;

import com.dentalstack.doctor.enums.organization.ProfileStatus;
import com.dentalstack.doctor.enums.organization.ProfileType;
import java.util.List;

public interface DoctorDetailsSummary {
    Long getId();

    String getUUID();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobile();

    String getCountryName();

    Boolean getIsDrToDisplay();

    Boolean getIsOnBoardScreenVisited();

    String getDescription();

    String getProfileImage();

    List<OrganizationSummary> getOrganizations();

    List<ProfileSummary> getProfiles();

    interface OrganizationSummary {
        Long getOrganizationId();

        String getName();

        String getDescription();

        Boolean getActive();
    }

    interface ProfileSummary {
        Long getProfileId();

        ProfileType getProfileType();

        ProfileStatus getStatus();
    }
}
