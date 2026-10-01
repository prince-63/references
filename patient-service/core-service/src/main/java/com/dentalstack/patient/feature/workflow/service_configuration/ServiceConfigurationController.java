package com.dentalstack.patient.feature.workflow.service_configuration;

import com.dentalstack.patient.feature.workflow.service_configuration.dto.*;
import com.dentalstack.patient.feature.workflow.service_configuration.service.ServiceConfigurationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Service configuration", description = "Service configuration API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/service-configuration")
public class ServiceConfigurationController {

    private final ServiceConfigurationService serviceConfigurationService;

    @PostMapping
    public ResponseEntity<ServiceItemResponseDTO> createServiceItem(
            @Valid @RequestBody ServiceItemRequestDTO requestDTO) {
        ServiceItemResponseDTO response = serviceConfigurationService.createServiceItem(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceItemResponseDTO>> getAllServiceItems() {
        List<ServiceItemResponseDTO> items = serviceConfigurationService.getAllServiceItems();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/assign")
    public ResponseEntity<ServiceConfigurationResponseDTO> assignServiceItemsToUser(
            @Valid @RequestBody AssignServiceItemsRequestDTO requestDTO) {
        ServiceConfigurationResponseDTO response = serviceConfigurationService.assignServiceItemsToUser(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{profileId}")
    public ResponseEntity<ServiceConfigurationResponseDTO> getServiceConfigurationByProfile(
            @PathVariable Long profileId) {
        ServiceConfigurationResponseDTO response =
                serviceConfigurationService.getServiceConfigurationByProfile(profileId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public void removeServiceConfiguration(@RequestBody RemoveServiceConfigurationItemStatusRequest request) {
        serviceConfigurationService.updateServiceItemStatus(request);
    }

    @PostMapping("/enable")
    public ResponseEntity<ServiceConfigurationResponseDTO> enableServiceItemsForUser(
            @Valid @RequestBody EnableDisableServiceItemsRequestDTO requestDTO) {
        return ResponseEntity.ok(serviceConfigurationService.enableServiceItemsForUser(requestDTO));
    }

    @PostMapping("/disable")
    public ResponseEntity<ServiceConfigurationResponseDTO> disableServiceItemsForUser(
            @Valid @RequestBody EnableDisableServiceItemsRequestDTO requestDTO) {
        return ResponseEntity.ok(serviceConfigurationService.disableServiceItemsForUser(requestDTO));
    }

    @PostMapping("/remove")
    public ResponseEntity<ServiceConfigurationResponseDTO> removeServiceItemsForUser(
            @Valid @RequestBody EnableDisableServiceItemsRequestDTO requestDTO) {
        return ResponseEntity.ok(serviceConfigurationService.removeServiceItemsForUser(requestDTO));
    }
}
