package com.dentalstack.patient.feature.treatment.dto.production;

import com.dentalstack.patient.feature.treatment.enums.Compliance;
import com.dentalstack.patient.feature.treatment.enums.JawType;
import com.dentalstack.patient.feature.treatment.enums.OrderStatus;
import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.treatment.enums.production.ProductionStatus;
import com.dentalstack.patient.global.enums.UserType;
import java.time.LocalDate;
import java.time.LocalTime;
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
public class AlignerProductionOrderAllDTO {
    private AlignerProductionDTO alignerProductionDTO;
    private AlignerProductionOrderDTO alignerProductionOrderDTO;
    private AlignerProductionLabDTO alignerProductionLabDTO;
    private AlignerProductionOrderDTO alignerProductionOrderReminderDetails;
    private AlignerDTO alignerDTO;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlignerProductionDTO {
        private Long id;
        private Long alignerProductionOrderId;
        private Long alignerProductionLabId;
        private ProductionStatus status;
        private ProductionSubStatus subStatus;
        private Long alignerId;
        private List<AlignerProductionLogDTO> logs;
        private ZonedDateTime statusChangedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlignerProductionOrderDTO {
        private Long id;
        private OrderStatus status;
        private List<AlignerProductionDTO> alignerProductions;
        private List<AlignerProductionOrderUpdateLogsDetails.AlignerProductionOrderLogDetails> logs;
        private Long alignerJourneyId;
        private List<Long> reminderIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlignerProductionLabDTO {
        private Long id;
        private String name;
        private String logoUrl;
        private Long addedByUserId;
        private UserType addedByUserType;
        private Boolean isDefault;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlignerProductionLogDTO {
        private Long id;
        private int srNo;
        private String oldAlignerProductionLab;
        private String newAlignerProductionLab;
        private ProductionStatus oldProductionStatus;
        private ProductionStatus newProductionStatus;
        private ProductionSubStatus oldProductionSubStatus;
        private ProductionSubStatus newProductionSubStatus;
        private Long alignerProductionId;
        private Long alignerProductionOrderLogId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlignerDTO {
        private Long id;
        private int srNo;
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalDate changeDate;
        private LocalTime time;
        private JawType jawType;
        private int noOfDaysToWear;
        private Long alignerJourneyId;
        private List<Long> photoIds;
        private List<Long> actionIds;
        private List<Long> dailyWearTimeRecordIds;
        private List<Long> feedbackIds;
        private AlignerProductionDTO alignerProduction;
        private Compliance compliance;
    }
}
