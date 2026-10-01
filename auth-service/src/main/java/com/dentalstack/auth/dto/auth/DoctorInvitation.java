package com.dentalstack.auth.dto.auth;

import java.time.ZonedDateTime;
import java.util.List;

public class DoctorInvitation {
    private String uuid;
    private Long organizationId;
    private Long inviterUserProfileId;
    private Long inviterId;
    private Long invitedDoctorId;
    private String email;
    private String firstName;
    private String lastName;
    private String mobileNo;
    private String salutation;
    private String status;
    private List<String> invitationRole;
    private String countryCode;
    private String registrationType;
    private ZonedDateTime invitedAt;
    private ZonedDateTime expiresAt;
    private ZonedDateTime acceptedAt;
    private ZonedDateTime lastInvitationAt;
    private String invitationCode;
    private Long ownerId;
    private Long ownerProfileId;
}
