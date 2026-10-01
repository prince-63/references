package com.dentalstack.patient.feature.order.service;

import com.dentalstack.patient.feature.order.dto.CreateManufacturingRequest;
import com.dentalstack.patient.feature.order.dto.GetManufacturingRequest;
import com.dentalstack.patient.feature.order.dto.ManufacturingResponse;
import com.dentalstack.patient.feature.order.dto.ProcessedAndUnprocessedManufacturingResponse;
import com.dentalstack.patient.feature.order.dto.UpdateManufacturingRequest;
import com.dentalstack.patient.feature.order.dto.UpdateManufacturingShippingRequest;
import org.springframework.web.multipart.MultipartFile;

public interface ManufacturingService {
    ManufacturingResponse createManufacturing(CreateManufacturingRequest request);

    ProcessedAndUnprocessedManufacturingResponse getManufacturingList(GetManufacturingRequest request);

    ManufacturingResponse getManufacturingDetails(Long manufacturingId);

    ManufacturingResponse updateManufacturing(UpdateManufacturingRequest request);

    ManufacturingResponse updateShippingDetails(UpdateManufacturingShippingRequest request, MultipartFile[] document);
}
