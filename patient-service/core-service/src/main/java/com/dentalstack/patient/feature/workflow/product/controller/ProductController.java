package com.dentalstack.patient.feature.workflow.product.controller;

import com.dentalstack.patient.feature.workflow.product.dto.*;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.service.ServiceProductService;
import com.dentalstack.patient.global.exception.GenericException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Service product", description = "Service product API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/service-products")
public class ProductController {

    private final ServiceProductService serviceProductService;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ServiceProductResponse> createServiceProduct(
            @RequestParam("request") String reqStr, @RequestPart(name = "image", required = false) MultipartFile image)
            throws IOException {
        ServiceProductRequest request;
        try {
            request = mapper.readValue(reqStr, ServiceProductRequest.class);
        } catch (JsonProcessingException e) {
            throw new GenericException("Failed to parse service product details " + e);
        }
        ServiceProductResponse createdProduct = serviceProductService.createServiceProduct(request, image);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @GetMapping("/products/profile/{profileId}/type/{productType}")
    public ResponseEntity<List<ServiceProductResponse>> getServiceProductsByProfileId(
            @PathVariable Long profileId, @PathVariable String productType) {
        List<ServiceProductResponse> products =
                serviceProductService.getServiceProductsByProfileId(profileId, productType);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<ServiceProductResponse>> getServiceProductsByCategoryId(@PathVariable Long categoryId) {
        List<ServiceProductResponse> products = serviceProductService.getServiceProductsByCategoryId(categoryId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ServiceProductResponse> getServiceProductById(@PathVariable Long productId) {
        ServiceProductResponse product = serviceProductService.getServiceProductById(productId);
        return ResponseEntity.ok(product);
    }

    @PostMapping("/products/filter")
    @Tag(name = "Get Service Product By Filter")
    public ResponseEntity<ServiceProductFilterResponseDTO> getServiceProductByFilter(
            @RequestBody ServiceProductFilterRequestDTO request) {
        ServiceProductFilterResponseDTO response = serviceProductService.getServiceProductByFilter(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/products/{serviceProductId}")
    public ResponseEntity<ServiceProductResponse> updateServiceProduct(
            @PathVariable Long serviceProductId,
            @RequestPart("request") String reqStr,
            @RequestPart(required = false) MultipartFile image)
            throws IOException {
        ServiceProductRequest request = mapper.readValue(reqStr, ServiceProductRequest.class);
        ServiceProductResponse updated = serviceProductService.updateServiceProduct(serviceProductId, request, image);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/products/{serviceProductId}")
    public ResponseEntity<Void> deleteServiceProduct(
            @PathVariable Long serviceProductId, @RequestParam Long profileId) {
        serviceProductService.deleteServiceProduct(serviceProductId, profileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/products/toggle-status/{productId}")
    public ResponseEntity<ServiceProductResponse> toggleProductStatus(@PathVariable Long productId) {
        ServiceProduct toggledProduct = serviceProductService.toggleProductStatus(productId);
        return ResponseEntity.ok(ServiceProductResponse.from(toggledProduct));
    }

    @PostMapping("/defualt/assign")
    public void addDefaultProduct(@RequestBody DefaultServiceProductRequest request) {
        serviceProductService.addDefaultProduct(request);
    }
}
