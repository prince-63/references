package com.dentalstack.patient.feature.workflow.service_configuration.service;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.dto.*;
import com.dentalstack.patient.feature.workflow.service_configuration.entity.ServiceConfiguration;
import com.dentalstack.patient.feature.workflow.service_configuration.entity.ServiceItem;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceItemRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceConfigurationServiceImpl implements ServiceConfigurationService {

    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    public ServiceItemResponseDTO createServiceItem(ServiceItemRequestDTO requestDTO) {

        if (serviceItemRepository.existsByItemName(requestDTO.getItemName())) {
            throw new GenericException("Service item with name '" + requestDTO.getItemName() + "' already exists");
        }

        ServiceItem serviceItem = ServiceItem.builder()
                .itemName(requestDTO.getItemName())
                .displayOrder(requestDTO.getDisplayOrder())
                .isActive(requestDTO.getIsActive() != null ? requestDTO.getIsActive() : true)
                .build();

        ServiceItem savedItem = serviceItemRepository.save(serviceItem);

        return mapToServiceItemResponseDTO(savedItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceItemResponseDTO> getAllServiceItems() {
        return serviceItemRepository.findAll().stream()
                .map(this::mapToServiceItemResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public ServiceConfigurationResponseDTO getServiceConfigurationByProfile(Long profileId) {
        log.info("Fetching service configuration for profile: {}", profileId);

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null || userProfile.isInternalUser()) {
            userProfile = userProfile.getInviterProfile();
        }
        UserProfile finalUserProfile = userProfile;
        ServiceConfiguration serviceConfiguration = serviceConfigurationRepository
                .findByUserProfile(userProfile)
                .orElseThrow(() -> {
                    assert finalUserProfile != null;
                    return new GenericException(
                            "Service configuration not found for profile: " + finalUserProfile.getId());
                });

        return mapToServiceConfigurationResponseDTO(serviceConfiguration);
    }

    @Override
    @Transactional
    public ServiceConfigurationResponseDTO assignServiceItemsToUser(AssignServiceItemsRequestDTO requestDTO) {
        log.info("Assigning service items to user profile: {}", requestDTO.getProfileId());

        UserProfile userProfile = userProfileRepository
                .findById(requestDTO.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(requestDTO.getProfileId()));

        Set<ServiceItem> serviceItems = validateAndFetchServiceItems(requestDTO.getServiceItemIds());

        ServiceConfiguration serviceConfiguration =
                serviceConfigurationRepository.findByUserProfile(userProfile).orElse(null);

        if (serviceConfiguration == null) {
            serviceConfiguration = ServiceConfiguration.builder()
                    .userProfile(userProfile)
                    .enabledItems(serviceItems)
                    .disabledItems(new HashSet<>())
                    .build();
        } else {

            serviceConfiguration.setEnabledItems(serviceItems);

            serviceConfiguration.getDisabledItems().removeAll(serviceItems);
        }

        ServiceConfiguration savedConfig = serviceConfigurationRepository.save(serviceConfiguration);
        log.info(
                "Successfully assigned {} service items to profile: {}",
                serviceItems.size(),
                requestDTO.getProfileId());

        return mapToServiceConfigurationResponseDTO(savedConfig);
    }

    @Transactional
    @Override
    public ServiceConfigurationResponseDTO updateServiceConfiguration(ServiceConfigurationUpdateRequestDTO requestDTO) {
        log.info(
                "Updating service configuration for profile: {}, action: {}",
                requestDTO.getProfileId(),
                requestDTO.getAction());

        UserProfile userProfile = userProfileRepository
                .findById(requestDTO.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(requestDTO.getProfileId()));

        Set<ServiceItem> serviceItems = validateAndFetchServiceItems(requestDTO.getServiceItemIds());

        ServiceConfiguration serviceConfiguration = serviceConfigurationRepository
                .findByUserProfile(userProfile)
                .orElseGet(() -> createDefaultConfiguration(userProfile));

        switch (requestDTO.getAction()) {
            case ENABLE:
                enableServiceItems(serviceConfiguration, serviceItems);
                break;
            case DISABLE:
                disableServiceItems(serviceConfiguration, serviceItems);
                break;
            case REMOVE:
                removeServiceItems(serviceConfiguration, serviceItems);
                break;
            default:
                throw new GenericException("Invalid action: " + requestDTO.getAction());
        }

        ServiceConfiguration savedConfig = serviceConfigurationRepository.save(serviceConfiguration);

        log.info("Successfully updated service configuration for profile: {}", requestDTO.getProfileId());

        return mapToServiceConfigurationResponseDTO(savedConfig);
    }

    @Transactional
    @Override
    public ServiceConfigurationResponseDTO enableServiceItemsForUser(EnableDisableServiceItemsRequestDTO requestDTO) {
        log.info("Enabling service items for profile: {}", requestDTO.getProfileId());

        return updateServiceConfiguration(ServiceConfigurationUpdateRequestDTO.builder()
                .profileId(requestDTO.getProfileId())
                .serviceItemIds(requestDTO.getServiceItemIds())
                .action(ServiceConfigurationUpdateRequestDTO.ServiceAction.ENABLE)
                .build());
    }

    @Transactional
    @Override
    public ServiceConfigurationResponseDTO disableServiceItemsForUser(EnableDisableServiceItemsRequestDTO requestDTO) {
        log.info("Disabling service items for profile: {}", requestDTO.getProfileId());

        return updateServiceConfiguration(ServiceConfigurationUpdateRequestDTO.builder()
                .profileId(requestDTO.getProfileId())
                .serviceItemIds(requestDTO.getServiceItemIds())
                .action(ServiceConfigurationUpdateRequestDTO.ServiceAction.DISABLE)
                .build());
    }

    @Transactional
    @Override
    public ServiceConfigurationResponseDTO removeServiceItemsForUser(EnableDisableServiceItemsRequestDTO requestDTO) {
        log.info("Removing service items for profile: {}", requestDTO.getProfileId());

        return updateServiceConfiguration(ServiceConfigurationUpdateRequestDTO.builder()
                .profileId(requestDTO.getProfileId())
                .serviceItemIds(requestDTO.getServiceItemIds())
                .action(ServiceConfigurationUpdateRequestDTO.ServiceAction.REMOVE)
                .build());
    }

    @Override
    @Transactional
    public void updateServiceItemStatus(RemoveServiceConfigurationItemStatusRequest request) {
        log.info(
                "Removing service item from enabled items for profile: {}, item: {}",
                request.getProfileId(),
                request.getConfigurationItemId());

        ServiceConfiguration serviceConfiguration =
                serviceConfigurationRepository.findByUserProfileId(request.getProfileId());

        if (serviceConfiguration != null) {
            ServiceItem itemToRemove = serviceItemRepository
                    .findById(request.getConfigurationItemId())
                    .orElseThrow(() -> new GenericException(
                            "Service item not found with id: " + request.getConfigurationItemId()));

            serviceConfiguration.getEnabledItems().removeIf(item -> item.getId()
                    .equals(request.getConfigurationItemId()));

            if (itemToRemove.getIsActive()) {
                serviceConfiguration.getDisabledItems().add(itemToRemove);
            }

            serviceConfigurationRepository.save(serviceConfiguration);

            log.info(
                    "Successfully moved service item {} to disabled items for profile: {}",
                    request.getConfigurationItemId(),
                    request.getProfileId());
        }
    }

    @Transactional
    @Override
    public ServiceConfigurationResponseDTO resetToDefaultConfiguration(Long profileId) {
        log.info("Resetting service configuration to default for profile: {}", profileId);

        UserProfile userProfile =
                userProfileRepository.findById(profileId).orElseThrow(() -> new DoctorNotFoundException(profileId));

        ServiceConfiguration defaultConfig = createDefaultConfiguration(userProfile);

        ServiceConfiguration existingConfig =
                serviceConfigurationRepository.findByUserProfile(userProfile).orElse(null);

        if (existingConfig != null) {
            defaultConfig.setId(existingConfig.getId());
        }

        ServiceConfiguration savedConfig = serviceConfigurationRepository.save(defaultConfig);

        log.info("Successfully reset service configuration to default for profile: {}", profileId);

        return mapToServiceConfigurationResponseDTO(savedConfig);
    }

    private ServiceConfiguration createDefaultConfiguration(UserProfile userProfile) {
        log.debug("Creating default service configuration for profile: {}", userProfile.getId());

        Set<ServiceItem> allActiveItems = serviceItemRepository.findByIsActiveTrue();

        return ServiceConfiguration.builder()
                .userProfile(userProfile)
                .enabledItems(new HashSet<>(allActiveItems))
                .disabledItems(new HashSet<>())
                .build();
    }

    private Set<ServiceItem> validateAndFetchServiceItems(Set<Long> serviceItemIds) {
        Set<ServiceItem> serviceItems = new HashSet<>();

        for (Long itemId : serviceItemIds) {
            ServiceItem serviceItem = serviceItemRepository
                    .findById(itemId)
                    .orElseThrow(() -> new GenericException("Service item not found with id: " + itemId));

            if (!serviceItem.getIsActive()) {
                throw new GenericException("Service item is inactive and cannot be configured: " + itemId);
            }

            serviceItems.add(serviceItem);
        }

        return serviceItems;
    }

    private void enableServiceItems(ServiceConfiguration config, Set<ServiceItem> itemsToEnable) {

        config.getDisabledItems().removeAll(itemsToEnable);

        config.getEnabledItems().addAll(itemsToEnable);

        log.debug(
                "Enabled {} service items for profile: {}",
                itemsToEnable.size(),
                config.getUserProfile().getId());
    }

    private void disableServiceItems(ServiceConfiguration config, Set<ServiceItem> itemsToDisable) {

        config.getEnabledItems().removeAll(itemsToDisable);

        config.getDisabledItems().addAll(itemsToDisable);

        log.debug(
                "Disabled {} service items for profile: {}",
                itemsToDisable.size(),
                config.getUserProfile().getId());
    }

    private ServiceItemResponseDTO mapToServiceItemResponseDTO(ServiceItem serviceItem) {
        return ServiceItemResponseDTO.builder()
                .id(serviceItem.getId())
                .itemName(serviceItem.getItemName())
                .displayOrder(serviceItem.getDisplayOrder())
                .isActive(serviceItem.getIsActive())
                .build();
    }

    private void removeServiceItems(ServiceConfiguration config, Set<ServiceItem> itemsToRemove) {

        config.getEnabledItems().removeAll(itemsToRemove);
        config.getDisabledItems().removeAll(itemsToRemove);

        log.debug(
                "Removed {} service items from both enabled and disabled for profile: {}",
                itemsToRemove.size(),
                config.getUserProfile().getId());
    }

    private ServiceConfigurationResponseDTO mapToServiceConfigurationResponseDTO(ServiceConfiguration config) {
        List<ServiceItemResponseDTO> enabledItems = config.getEnabledItems().stream()
                .map(this::mapToServiceItemResponseDTO)
                .collect(Collectors.toList());

        List<ServiceItemResponseDTO> disabledItems = config.getDisabledItems().stream()
                .map(this::mapToServiceItemResponseDTO)
                .collect(Collectors.toList());

        return ServiceConfigurationResponseDTO.builder()
                .id(config.getId())
                .profileId(config.getUserProfile().getId())
                .enabledItems(enabledItems)
                .disabledItems(disabledItems)
                .build();
    }
}
