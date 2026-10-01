package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspPatientListResponse {
    private List<VspPatientSummaryDTO> patients;
    private PaginationDetails pagination;

    @Data
    @Builder
    public static class VspPatientSummaryDTO {
        private Long patientId;
        private String fullName;
        private String initials;
        private String profilePictureUrl;
        private String email;
        private String mobileNo;
        private String customerMappedId;
        private String practiceLocationName;
        private Long practiceLocationId;

        private String productName;
        private String caseType;
        private String vspOrderStatus;
        private String nextAction;
        private Integer currentStep;

        private LocalDateTime lastUpdated;

        private String invitationStatus;
        private Boolean isInvitationSent;
    }
}
