package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientOrderDetails {
    private String orderId;
    private Boolean caseSubmitted;
    private Long patientId;
    private ZonedDateTime orderCreationDate;
    private OrderType orderType;
    private OrderStatus orderStatus;
    private JsonNode serviceProducts;
    private String linkedOrderId;
    private List<TreatmentPlanInfo> treatmentPlans;
    private String patientName;
    private String gender;
    private Integer age;
    private Boolean isClonedOrder;
    private String productType;
    private String productName;
    private String productDescription;
    private String productImage;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TreatmentPlanInfo {
        private Long treatmentPlanId;
        private OrderTreatmentPlanStatus approverStatus;
        private OrderTreatmentPlanStatus initiatorStatus;
        private AlignerTreatmentStatus status;
    }
}
