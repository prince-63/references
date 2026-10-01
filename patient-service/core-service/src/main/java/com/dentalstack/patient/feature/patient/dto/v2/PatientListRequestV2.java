package com.dentalstack.patient.feature.patient.dto.v2;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Sort;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientListRequestV2 {
    private Long organizationId;
    private Long profileId;
    private Long practiceLocationId;
    private String customerMappedId;
    private String search;
    private String patientType;

    private Long productId;

    private Long clinicId;

    private String caseType;

    private OrderStatus orderStatus;

    private int pageNumber;
    private int pageSize;

    private String sortBy;
    private Sort.Direction sortDirection;

    private LocalDateTime lastUpdatedFrom;
    private LocalDateTime lastUpdatedTo;
}
