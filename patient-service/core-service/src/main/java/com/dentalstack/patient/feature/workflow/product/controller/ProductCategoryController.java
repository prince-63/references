package com.dentalstack.patient.feature.workflow.product.controller;

import com.dentalstack.patient.feature.workflow.product.dto.ProductCategoryGetRequest;
import com.dentalstack.patient.feature.workflow.product.dto.ProductCategoryRequest;
import com.dentalstack.patient.feature.workflow.product.dto.ProductCategoryResponse;
import com.dentalstack.patient.feature.workflow.product.service.ServiceProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Product category", description = "Product category API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/service-products")
public class ProductCategoryController {

    private final ServiceProductService serviceProductService;

    @PostMapping("/categories")
    public ResponseEntity<ProductCategoryResponse> createProductCategory(
            @Valid @RequestBody ProductCategoryRequest request) {
        ProductCategoryResponse createdCategory = serviceProductService.createProductCategory(request);
        return ResponseEntity.ok(createdCategory);
    }

    @GetMapping("/categories/profile/{profileId}")
    public ResponseEntity<List<ProductCategoryResponse>> getProductCategoriesByProfileId(@PathVariable Long profileId) {
        List<ProductCategoryResponse> categories = serviceProductService.getProductCategoriesByProfileId(profileId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/filter-categories")
    public ResponseEntity<List<ProductCategoryResponse>> getProductCategoryByFilter(
            @Valid @RequestBody ProductCategoryGetRequest request) {
        List<ProductCategoryResponse> categories = serviceProductService.getProductCategoryByFilter(request);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<ProductCategoryResponse> getProductCategoryById(@PathVariable Long categoryId) {
        ProductCategoryResponse category = serviceProductService.getProductCategoryById(categoryId);
        return ResponseEntity.ok(category);
    }
}
