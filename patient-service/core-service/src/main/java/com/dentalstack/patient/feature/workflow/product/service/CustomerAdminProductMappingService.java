package com.dentalstack.patient.feature.workflow.product.service;

import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductAssigneeRequest;
import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductFilterRequest;
import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductFilterResponse;

public interface CustomerAdminProductMappingService {
    void assigneeToCustomer(CustomerAdminProductAssigneeRequest request);

    void removeFromCustomer(CustomerAdminProductAssigneeRequest request);

    CustomerAdminProductFilterResponse getProductsForCustomer(CustomerAdminProductFilterRequest request);
}
