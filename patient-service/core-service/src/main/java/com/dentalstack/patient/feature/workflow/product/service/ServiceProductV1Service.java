package com.dentalstack.patient.feature.workflow.product.service;

import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductResponse;
import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductV2Request;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.repository.DisableCustomerProductMappingRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ServiceProductV1Service {
    private final ServiceProductRepository serviceProductRepository;
    private final DisableCustomerProductMappingRepository disableCustomerProductMappingRepository;

    public List<ServiceProductResponse> getAllServiceProduct(ServiceProductV2Request request) {
        if (request == null
                || request.getOwnerProfileId() == null
                || request.getOwnerOrganizationId() == null
                || request.getCustomerProfileId() == null
                || request.getServiceProductForUser() == null) {
            throw new GenericException("Invalid service product request");
        }

        List<ServiceProduct> serviceProducts = serviceProductRepository.findAllByOwnerProfile(
                request.getOwnerProfileId(), request.getEnabledProduct(), request.getDefaultProduct());

        if (serviceProducts.isEmpty()) {
            return List.of();
        }

        Set<Long> disabledProductIds = new HashSet<>(disableCustomerProductMappingRepository.findAllDisabledProductIds(
                request.getOwnerProfileId(), request.getOwnerOrganizationId(), request.getCustomerProfileId()));

        if ("CUSTOMER".equalsIgnoreCase(request.getServiceProductForUser())) {
            return serviceProducts.stream()
                    .filter(sp -> !disabledProductIds.contains(sp.getId()))
                    .map(sp -> ServiceProductResponse.from(sp, false))
                    .toList();
        }

        if ("OWNER".equalsIgnoreCase(request.getServiceProductForUser())) {
            return serviceProducts.stream()
                    .map(sp -> ServiceProductResponse.from(sp, disabledProductIds.contains(sp.getId())))
                    .toList();
        }

        throw new GenericException("Invalid serviceProductForUser value");
    }
}
