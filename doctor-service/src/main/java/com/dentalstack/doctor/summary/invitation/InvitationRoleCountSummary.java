package com.dentalstack.doctor.summary.invitation;

public interface InvitationRoleCountSummary {
    Long getConsultingOrthodontistCount();

    Long getClinicOwnerCount();

    Long getInOfficeManufacturerCount();

    Long getAlignerCompanyOrLabCount();

    Long getCommercialAlignerLabCount();

    Long getLabStaffCount();

    Long getInvitedLabStaffCount();

    Long getActiveLabStaffCount();

    Long getCustomerCount();

    Long getInvitedCustomerCount();

    Long getActiveCustomerCount();

    Boolean getIsDeactivated();

    Long getVendorCount();

    Long getInvitedVendorCount();

    Long getActiveVendorCount();

    String getStatus();
}
