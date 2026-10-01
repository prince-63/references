package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.entity.VspProduction;
import com.dentalstack.patient.feature.vsp.enums.VspProductionStatus;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspProductionResponse {
    private String productionId;
    private String vspOrderId;
    private VspProductionStatus status;

    private int intermediateSplintQty;
    private int finalSplintQty;
    private int dentalArchesUpperQty;
    private int dentalArchesLowerQty;
    private int othersCustomQty;
    private int totalItems;

    private String productionNotes;

    private List<VspProductionStlFileResponse> stlFiles;

    private VspProductionShippingResponse shipping;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static VspProductionResponse from(VspProduction p) {
        return VspProductionResponse.builder()
                .productionId(p.getId())
                .vspOrderId(p.getVspOrder().getId())
                .status(p.getStatus())
                .intermediateSplintQty(p.getIntermediateSplintQty())
                .finalSplintQty(p.getFinalSplintQty())
                .dentalArchesUpperQty(p.getDentalArchesUpperQty())
                .dentalArchesLowerQty(p.getDentalArchesLowerQty())
                .othersCustomQty(p.getOthersCustomQty())
                .totalItems(p.getTotalItems())
                .productionNotes(p.getProductionNotes())
                .stlFiles(
                        p.getStlFiles() != null
                                ? p.getStlFiles().stream()
                                        .map(VspProductionStlFileResponse::from)
                                        .collect(Collectors.toList())
                                : List.of())
                .shipping(p.getShipping() != null ? VspProductionShippingResponse.from(p.getShipping()) : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
