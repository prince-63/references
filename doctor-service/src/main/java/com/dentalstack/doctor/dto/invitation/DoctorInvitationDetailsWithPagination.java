package com.dentalstack.doctor.dto.invitation;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorInvitationDetailsWithPagination {

    List<DoctorInvitationDetails> doctorInvitationDetailsList;
    private PaginationDetails pagination;

    @Builder
    @Data
    public static class PaginationDetails {
        private int pageNumber;
        private int pageSize;
        private long totalPatients;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private long activeInvitationCount;
        private long pendingInvitationCount;
    }
}
