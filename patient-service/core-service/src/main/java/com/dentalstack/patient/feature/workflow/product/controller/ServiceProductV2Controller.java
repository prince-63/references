package com.dentalstack.patient.feature.workflow.product.controller;

import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductV2Request;
import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductV2Response;
import com.dentalstack.patient.feature.workflow.product.service.ServiceProductV2Service;
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
@RequestMapping("/patient/service-products/v2")
public class ServiceProductV2Controller {

    private final ServiceProductV2Service serviceProductV2Service;

    @PostMapping
    public List<ServiceProductV2Response> getAllServiceProduct(@RequestBody ServiceProductV2Request request) {
        return serviceProductV2Service.getAllServiceProduct(request);
    }
}
