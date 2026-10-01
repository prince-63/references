package com.dentalstack.patient.feature.workflow.product.controller;

import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductAssigneeRequest;
import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductFilterRequest;
import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductFilterResponse;
import com.dentalstack.patient.feature.workflow.product.service.CustomerAdminProductMappingService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/service-products")
@RequiredArgsConstructor
public class CustomerAdminProductMappingController {

    private final CustomerAdminProductMappingService mappingService;

    @Operation(summary = "Assign a service product to a customer admin")
    @PostMapping("/assign")
    public ResponseEntity<Void> assignToCustomer(@RequestBody CustomerAdminProductAssigneeRequest request) {
        mappingService.assigneeToCustomer(request);
        return ResponseEntity.status(201).build();
    }

    @Operation(summary = "Remove product assignment")
    @DeleteMapping("/assign/remove")
    public ResponseEntity<Void> removeFromCustomer(
            @RequestParam("assigneeId") Long assigneeProfileId,
            @RequestParam("ownerId") Long ownerProfileId,
            @RequestParam("productId") Long productId) {

        var request = CustomerAdminProductAssigneeRequest.builder()
                .assigneeProfileId(assigneeProfileId)
                .ownerProfileId(ownerProfileId)
                .productId(productId)
                .build();

        mappingService.removeFromCustomer(request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get products visible to a specific customer")
    @GetMapping("/customer/products")
    public ResponseEntity<CustomerAdminProductFilterResponse> getProductsForCustomer(
            @RequestParam("profileId") Long profileId,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "categoryName", required = false) String categoryName,
            @RequestParam(value = "productType", required = false) String productType,
            @RequestParam(value = "search", required = false) String search) {
        CustomerAdminProductFilterRequest request = new CustomerAdminProductFilterRequest();
        request.setProfileId(profileId);
        request.setCategoryId(categoryId);
        request.setCategoryName(categoryName);
        request.setProductType(productType);
        request.setSearch(search);

        CustomerAdminProductFilterResponse response = mappingService.getProductsForCustomer(request);
        return ResponseEntity.ok(response);
    }
}
