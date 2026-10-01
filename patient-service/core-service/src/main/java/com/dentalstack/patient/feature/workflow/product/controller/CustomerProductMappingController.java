package com.dentalstack.patient.feature.workflow.product.controller;

import com.dentalstack.patient.feature.workflow.product.dto.DisableServiceProductRequest;
import com.dentalstack.patient.feature.workflow.product.service.DisableServiceProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patient/service-products")
@RequiredArgsConstructor
public class CustomerProductMappingController {

    private final DisableServiceProductService disableServiceProductService;

    @PostMapping("/disable")
    public ResponseEntity<Void> disableProductToCustomer(@RequestBody DisableServiceProductRequest request) {
        disableServiceProductService.disableProductToCustomer(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/enable")
    public ResponseEntity<Void> enableProductForCustomer(@RequestBody DisableServiceProductRequest request) {
        disableServiceProductService.enableProductForCustomer(request);
        return ResponseEntity.ok().build();
    }
}
