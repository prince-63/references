package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.storage.dto.FileDetails;
import com.dentalstack.patient.feature.tracking.dto.CurrentAlignerDetails;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerTreatmentResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private static final Logger log = LoggerFactory.getLogger(AlignerTreatmentResponse.class);

    private Long patientId;

    private ProductTypeName treatmentSubType;

    private String brandName;

    private AlignerTreatmentDetails alignerDetailsMetaData;

    private String treatmentPlanningSoftware;

    private String treatmentPlanningLink;

    private String remarks;

    private Integer daysToWearEachAligner;

    private Integer recommendedHoursToWearAligners;

    private Integer currentAlignerNo;
    private UpperJawDetails upperJawDetails;
    private LowerJawDetails lowerJawDetails;

    private AlignerTreatmentStatus status;

    private List<FileDetails> files;

    private List<FileDetails> pdfFiles;

    private List<FileDetails> otherFiles;

    private Long doctorId;

    private long treatmentPlanId;

    private Long alignerJourneyId;

    private Integer totalAligners;

    private Long productionLabId;

    private ProductionLabDetails productionLabDetails;

    private CurrentAlignerDetails currentAlignerDetails;

    private String timeRemainingToStartTreatment;

    private String treatmentType;

    private Long daysRemainingToStartTreatment;

    private String reasonForDeactivation;

    private LocalDate deactivatedAt;

    private String treatmentPlanName;

    private String deactivatedRemarks;
    private List<TreatmentPlanVideoResponse> treatmentPlanVideos;
    private Boolean isLinkDisplayPatient;
    private String treatmentPlanTagName;
    private Boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;
    private String orderId;
    private ZonedDateTime orderStatusChangedAt;
    private OrderTreatmentPlanStatus initiatorStatus;
    private OrderTreatmentPlanStatus approverStatus;
    private TreatmentPlanMetadata treatmentPlanMetadata;
    private ZonedDateTime updatedAt;
}
