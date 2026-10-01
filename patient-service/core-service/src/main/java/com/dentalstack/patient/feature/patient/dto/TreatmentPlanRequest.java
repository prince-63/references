package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.ProductionLabDetails;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentPlanUploadType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanMetadata;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TreatmentPlanRequest {

    private Long patientId;
    private String name;
    private ProductTypeName treatmentSubType;
    private Long doctorId;
    private AlignerTreatmentDetails alignerTreatmentDetails;
    private String treatmentPlanningSoftware;
    private String treatmentPlanningLink;
    private String remarks;
    private Integer daysToWearEachAligner;
    private Integer recommendedHoursToWearAligners;
    private Integer currentAlignerNo;
    private AlignerTreatmentStatus status;
    private Long treatmentPlanId;
    private String treatmentType;
    private LocalDate startDate;
    private LocalDate endDate;
    private ProductionLabDetails productionLabDetails;
    private UserType userType;
    private BigDecimal pricing;
    private Status trackingStatus;
    private TrackingType trackingType;
    private boolean askToPatientFill;
    private boolean isVideoDisplayToPatient;
    private boolean isLinkDisplayPatient;
    private String treatmentPlanTagName;
    private Boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;
    private String orderId;
    private ZonedDateTime orderStatusChangedAt;
    private OrderTreatmentPlanStatus initiatorStatus;
    private OrderTreatmentPlanStatus approverStatus;
    private TreatmentPlanMetadata treatmentPlanMetadata;
    private Long profileId;
    private STLFileMetadata stlFileMetadata;
    private TreatmentPlanUploadType treatmentPlanUploadType;
    private Long linkedTreatmentPlanId;
    private List<Long> fileIdsToClone;
}
