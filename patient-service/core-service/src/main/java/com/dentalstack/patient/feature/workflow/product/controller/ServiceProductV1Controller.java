package com.dentalstack.patient.feature.workflow.product.controller;

import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductResponse;
import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductV2Request;
import com.dentalstack.patient.feature.workflow.product.service.ServiceProductV1Service;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Service product v2", description = "Service product API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/service-products/v1")
public class ServiceProductV1Controller {

    private final ServiceProductV1Service serviceProductV1Service;

    @PostMapping
    public List<ServiceProductResponse> getAllServiceProduct(@RequestBody ServiceProductV2Request request) {
        return serviceProductV1Service.getAllServiceProduct(request);
    }
}
