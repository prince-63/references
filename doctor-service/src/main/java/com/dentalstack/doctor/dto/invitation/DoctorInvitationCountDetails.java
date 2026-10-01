package com.dentalstack.doctor.dto.invitation;

import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.summary.invitation.InvitationRoleCountSummary;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorInvitationCountDetails {
    private Long userCount;
    private Long invitedLabStaffCount;
    private Long activeLabStaffCount;

    private Long customerCount;
    private Long invitedCustomerCount;
    private Long activeCustomerCount;

    private Long vendorCount;
    private Long invitedVendorCount;
    private Long activeVendorCount;

    private boolean isBrandAndCompanyDetailsAdded;
    private Boolean isLabStaffDeactivated;

    public static DoctorInvitationCountDetails from(
            InvitationRoleCountSummary summary,
            boolean isBillingAdded,
            String invitationStatus,
            InvitationRoleCountSummary receivedInvitationCount) {
        return DoctorInvitationCountDetails.builder()
                .customerCount(summary.getCustomerCount() + receivedInvitationCount.getInvitedCustomerCount())
                .invitedCustomerCount(
                        summary.getInvitedCustomerCount() + receivedInvitationCount.getInvitedCustomerCount())
                .activeCustomerCount(
                        summary.getActiveCustomerCount() + receivedInvitationCount.getActiveCustomerCount())
                .vendorCount(summary.getVendorCount())
                .invitedVendorCount(summary.getInvitedVendorCount())
                .activeVendorCount(summary.getActiveVendorCount())
                .isBrandAndCompanyDetailsAdded(isBillingAdded)
                .isLabStaffDeactivated(Objects.equals(invitationStatus, InvitationStatus.DEACTIVATED.name()))
                .userCount(summary.getLabStaffCount())
                .invitedLabStaffCount(summary.getInvitedLabStaffCount())
                .activeLabStaffCount(summary.getActiveLabStaffCount())
                .build();
    }

    public static DoctorInvitationCountDetails from(
            InvitationRoleCountSummary summary, boolean isBillingAdded, String invitationStatus) {
        return DoctorInvitationCountDetails.builder()
                .customerCount(summary.getCustomerCount())
                .invitedCustomerCount(summary.getInvitedCustomerCount())
                .activeCustomerCount(summary.getActiveCustomerCount())
                .vendorCount(summary.getVendorCount())
                .invitedVendorCount(summary.getInvitedVendorCount())
                .activeVendorCount(summary.getActiveVendorCount())
                .isBrandAndCompanyDetailsAdded(isBillingAdded)
                .isLabStaffDeactivated(Objects.equals(invitationStatus, InvitationStatus.DEACTIVATED.name()))
                .userCount(summary.getLabStaffCount())
                .invitedLabStaffCount(summary.getInvitedLabStaffCount())
                .activeLabStaffCount(summary.getActiveLabStaffCount())
                .build();
    }
}
