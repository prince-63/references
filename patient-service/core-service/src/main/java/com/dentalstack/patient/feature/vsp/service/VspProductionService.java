package com.dentalstack.patient.feature.vsp.service;

import com.dentalstack.patient.feature.vsp.dto.request.*;
import com.dentalstack.patient.feature.vsp.dto.response.VspProductionResponse;

public interface VspProductionService {

    VspProductionResponse createProduction(CreateVspProductionRequest request);

    VspProductionResponse getProduction(String productionId);

    VspProductionResponse getProductionByOrderId(String orderId);

    VspProductionResponse updateProduction(UpdateVspProductionRequest request);

    VspProductionResponse updateProductionStatus(UpdateVspProductionStatusRequest request);

    VspProductionResponse addShippingDetails(AddVspProductionShippingRequest request);

    VspProductionResponse updateShippingDetails(AddVspProductionShippingRequest request);
}
