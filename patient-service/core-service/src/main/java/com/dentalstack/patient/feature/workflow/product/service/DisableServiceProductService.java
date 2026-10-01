package com.dentalstack.patient.feature.workflow.product.service;

import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.doctor.repository.OrganizationRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.product.dto.DisableServiceProductRequest;
import com.dentalstack.patient.feature.workflow.product.entity.DisabledCustomerProductMapping;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.exception.AtLeastOneServiceProductExistsException;
import com.dentalstack.patient.feature.workflow.product.repository.DisableCustomerProductMappingRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class DisableServiceProductService {
    private final DisableCustomerProductMappingRepository disableCustomerProductMappingRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final ServiceProductRepository serviceProductRepository;

    @Transactional
    public void disableProductToCustomer(DisableServiceProductRequest request) {
        if (request == null
                || request.getOwnerProfileId() == null
                || request.getOwnerOrganizationId() == null
                || request.getCustomerProfileId() == null
                || request.getServiceProductId() == null) {
            throw new GenericException("Invalid DisableServiceProductRequest");
        }

        DisabledCustomerProductMapping existing = disableCustomerProductMappingRepository.findAlreadyDisabledProduct(
                request.getOwnerProfileId(),
                request.getOwnerOrganizationId(),
                request.getCustomerProfileId(),
                request.getServiceProductId());

        if (existing != null) {
            return;
        }

        List<ServiceProduct> allProducts =
                serviceProductRepository.findAllByOwnerProfile(request.getOwnerProfileId(), true, null);

        List<Long> alreadyDisabledProductIds = disableCustomerProductMappingRepository.findAllDisabledProductIds(
                request.getOwnerProfileId(), request.getOwnerOrganizationId(), request.getCustomerProfileId());

        long currentlyEnabledProducts = allProducts.stream()
                .filter(product -> !alreadyDisabledProductIds.contains(product.getId()))
                .count();

        if (currentlyEnabledProducts <= 1) {
            throw new AtLeastOneServiceProductExistsException(
                    "At least one service product must exist for the customer.");
        }

        UserProfile ownerProfile = userProfileRepository
                .findById(request.getOwnerProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getOwnerProfileId()));

        UserProfile customerProfile = userProfileRepository
                .findById(request.getCustomerProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getCustomerProfileId()));

        Organization ownerOrganization = organizationRepository
                .findById(request.getOwnerOrganizationId())
                .orElseThrow(() -> new GenericException("Organization not found: " + request.getOwnerOrganizationId()));

        ServiceProduct serviceProduct = serviceProductRepository
                .findById(request.getServiceProductId())
                .orElseThrow(() -> new GenericException("Service product not found: " + request.getServiceProductId()));

        if (!ownerProfile.getOrganization().getId().equals(ownerOrganization.getId())) {
            throw new GenericException("Owner profile does not belong to organization");
        }

        DisabledCustomerProductMapping disabledMapping = DisabledCustomerProductMapping.builder()
                .ownerProfile(ownerProfile)
                .disabledForProfile(customerProfile)
                .organization(ownerOrganization)
                .serviceProduct(serviceProduct)
                .build();

        disableCustomerProductMappingRepository.save(disabledMapping);
    }

    @Transactional
    public void enableProductForCustomer(DisableServiceProductRequest request) {
        if (request == null
                || request.getOwnerProfileId() == null
                || request.getOwnerOrganizationId() == null
                || request.getCustomerProfileId() == null
                || request.getServiceProductId() == null) {
            throw new IllegalArgumentException("Invalid DisableServiceProductRequest");
        }

        disableCustomerProductMappingRepository.deleteDisabledProduct(
                request.getOwnerProfileId(),
                request.getOwnerOrganizationId(),
                request.getCustomerProfileId(),
                request.getServiceProductId());
    }
}
