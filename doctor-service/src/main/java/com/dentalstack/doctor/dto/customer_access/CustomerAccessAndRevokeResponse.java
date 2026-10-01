package com.dentalstack.doctor.dto.customer_access;

import com.dentalstack.doctor.entity.CustomerAccessAndRevoke;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerAccessAndRevokeResponse {
    private Long customerProfileId;
    private Long invitorOrganizationId;
    private Boolean isTrackingEnabled;
    private Boolean isStlFileViewEnabled;
    private Boolean isScanFileViewEnabled;
    private Boolean isPrintFileViewEnabled;

    public static CustomerAccessAndRevokeResponse from(CustomerAccessAndRevoke customerAccessAndRevoke) {
        if (customerAccessAndRevoke == null) {
            return null;
        }

        return CustomerAccessAndRevokeResponse.builder()
                .customerProfileId(
                        customerAccessAndRevoke.getUserProfile() != null
                                ? customerAccessAndRevoke.getUserProfile().getId()
                                : null)
                .invitorOrganizationId(
                        customerAccessAndRevoke.getOrganization() != null
                                ? customerAccessAndRevoke.getOrganization().getId()
                                : null)
                .isTrackingEnabled(customerAccessAndRevoke.getIsTrackingEnabled())
                .isStlFileViewEnabled(customerAccessAndRevoke.getIsStlFileViewEnabled())
                .isScanFileViewEnabled(customerAccessAndRevoke.getIsScanFileViewEnabled())
                .isPrintFileViewEnabled(customerAccessAndRevoke.getIsPrintFileViewEnabled())
                .build();
    }
}
