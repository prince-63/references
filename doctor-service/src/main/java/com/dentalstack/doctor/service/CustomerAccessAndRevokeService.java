package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.customer_access.CustomerAccessAndRevokeRequest;
import com.dentalstack.doctor.dto.customer_access.CustomerAccessAndRevokeResponse;
import com.dentalstack.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.entity.invitation.DoctorInvitationCode;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.exception.GenericException;
import com.dentalstack.doctor.exception.doctor.UserNotFoundException;
import com.dentalstack.doctor.exception.invitation.DoctorInvitationNotFoundException;
import com.dentalstack.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.doctor.repository.invitation.DoctorInvitationCodeRepository;
import com.dentalstack.doctor.repository.user.OrganizationRepository;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CustomerAccessAndRevokeService {
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final DoctorInvitationCodeRepository doctorInvitationCodeRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationRepository organizationRepository;

    public void saveAccessAndRevokeDetails(Long profileId, String invitationCode) {
        UserProfile userProfile = userProfileRepository
                .findById(profileId)
                .orElseThrow(() ->
                        new UserNotFoundException("user profile not found for profile id: " + profileId.toString()));
        DoctorInvitationCode doctorInvitationCode = doctorInvitationCodeRepository
                .findByCodeIgnoreCase(invitationCode)
                .orElseThrow(() -> new DoctorInvitationNotFoundException(invitationCode));
        DoctorInvitation doctorInvitation = doctorInvitationCode.getDoctorInvitation();
        var details = CustomerAccessAndRevoke.builder()
                .userProfile(userProfile)
                .organization(doctorInvitation.getOrganization())
                .isTrackingEnabled(doctorInvitation.getIsTrackingEnabled())
                .isStlFileViewEnabled(doctorInvitation.getIsStlFileViewEnabled())
                .isPrintFileViewEnabled(doctorInvitation.getIsPrintFileViewEnabled())
                .isScanFileViewEnabled(doctorInvitation.getIsScanFileViewEnabled())
                .build();
        customerAccessAndRevokeRepository.save(details);
    }

    public CustomerAccessAndRevokeResponse getCustomerAccessDetails(CustomerAccessAndRevokeRequest request) {
        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                        request.getCustomerProfileId(), request.getInvitorOrganizationId());
        if (customerAccessAndRevoke.isPresent()) {
            return CustomerAccessAndRevokeResponse.from(customerAccessAndRevoke.get());
        } else {
            throw new GenericException("details not found pls send proper invitor org id and customer profile id");
        }
    }
}
