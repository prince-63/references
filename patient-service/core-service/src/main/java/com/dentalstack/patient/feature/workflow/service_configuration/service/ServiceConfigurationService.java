package com.dentalstack.patient.feature.workflow.service_configuration.service;

import com.dentalstack.patient.feature.workflow.service_configuration.dto.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

public interface ServiceConfigurationService {

    ServiceItemResponseDTO createServiceItem(@Valid ServiceItemRequestDTO requestDTO);

    List<ServiceItemResponseDTO> getAllServiceItems();

    @Transactional(readOnly = true)
    ServiceConfigurationResponseDTO getServiceConfigurationByProfile(Long profileId);

    ServiceConfigurationResponseDTO assignServiceItemsToUser(@Valid AssignServiceItemsRequestDTO requestDTO);

    @Transactional
    ServiceConfigurationResponseDTO updateServiceConfiguration(ServiceConfigurationUpdateRequestDTO requestDTO);

    @Transactional
    ServiceConfigurationResponseDTO enableServiceItemsForUser(EnableDisableServiceItemsRequestDTO requestDTO);

    @Transactional
    ServiceConfigurationResponseDTO disableServiceItemsForUser(EnableDisableServiceItemsRequestDTO requestDTO);

    @Transactional
    ServiceConfigurationResponseDTO removeServiceItemsForUser(EnableDisableServiceItemsRequestDTO requestDTO);

    void updateServiceItemStatus(RemoveServiceConfigurationItemStatusRequest request);

    @Transactional
    ServiceConfigurationResponseDTO resetToDefaultConfiguration(Long profileId);
}
