package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.CreateProductConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.request.UpdateProductConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.response.ProductConfigListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.ProductConfigResponse;
import com.dentalstack.patient.feature.rewards.service.RewardProductConfigService;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/patient/v1/rewards/products")
@RequiredArgsConstructor
public class RewardProductConfigController {

    private final RewardProductConfigService productConfigService;
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<ProductConfigListResponse> getAllProducts(@RequestHeader("profileId") Long userProfileId) {
        ProductConfigListResponse response = productConfigService.getAllProducts(userProfileId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ProductConfigResponse> createProduct(@Valid @RequestBody CreateProductConfigRequest request) {
        ProductConfigResponse response = productConfigService.createProduct(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
            value = "/",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Add reward product")
    public ResponseEntity<ProductConfigResponse> addRewardProductWithImage(
            @Parameter(name = "details", example = """

                    """) @RequestParam("details") String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile photo)
            throws IOException {
        CreateProductConfigRequest request;
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, CreateProductConfigRequest.class);
        } catch (JsonProcessingException e) {
            throw new BadRequestException(String.format("Invalid request format: %s", e.getMessage()));
        }
        ProductConfigResponse response = productConfigService.createProduct(request, photo);
        return ResponseEntity.ok(response);
    }

    @PutMapping("")
    public ResponseEntity<ProductConfigResponse> updateProduct(@Valid @RequestBody UpdateProductConfigRequest request) {
        ProductConfigResponse response = productConfigService.updateProduct(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping(
            value = "/",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update reward product")
    public ResponseEntity<ProductConfigResponse> updateProductWithImage(
            @Parameter(
                            name = "details",
                            example =
                                    """
                    {
                      "product_id": 1,
                      "product_name": "Premium Electric Toothbrush Pro",
                      "product_description": "Advanced electric toothbrush with 8 cleaning modes",
                      "coin_cost": 1800.00,
                      "monetary_value": 99.99
                      "terms_and_conditions": "Product warranty: 3 years. Limited time offer.",
                      "display_order": 2,
                      "is_featured": true,
                      "low_stock_threshold": 15,
                      "profile_id": 12345
                    }
                    """)
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile photo)
            throws IOException {

        UpdateProductConfigRequest request;
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, UpdateProductConfigRequest.class);
        } catch (JsonProcessingException e) {
            throw new BadRequestException(String.format("Invalid request format: %s", e.getMessage()));
        }

        ProductConfigResponse response = productConfigService.updateProduct(request, photo);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{productId}/inventory")
    public ResponseEntity<ProductConfigResponse> updateInventory(
            @RequestHeader("profileId") Long userProfileId,
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            @RequestParam String operation) {
        ProductConfigResponse response =
                productConfigService.updateInventory(userProfileId, productId, quantity, operation);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}/delete")
    public ResponseEntity<Void> deleteProduct(
            @RequestHeader("profileId") Long userProfileId, @PathVariable Long productId) {
        productConfigService.deleteProduct(userProfileId, productId);
        return ResponseEntity.noContent().build();
    }
}
