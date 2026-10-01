package com.dentalstack.patient.feature.workflow.card_display;

import com.dentalstack.patient.feature.workflow.card_display.dto.*;
import com.dentalstack.patient.feature.workflow.card_display.service.CardDisplayService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Card Display Config", description = "Card Display Config API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/card-display-config")
public class CardDisplayConfigController {

    private final CardDisplayService cardDisplayService;

    @PostMapping("/card-display-configs")
    public void createCardDisplayConfig(@Valid @RequestBody CreateCardDisplayConfigRequestDto request) {
        cardDisplayService.createCardDisplayConfig(request);
    }

    @PutMapping("/card-display-configs/{configId}")
    public ResponseEntity<CardDisplayConfigResponseDto> updateCardDisplayConfig(
            @PathVariable Long configId, @Valid @RequestBody UpdateCardDisplayConfigRequestDto request) {
        CardDisplayConfigResponseDto response = cardDisplayService.updateCardDisplayConfig(configId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/card-display-configs/{configId}")
    public ResponseEntity<CardDisplayConfigResponseDto> getCardDisplayConfigById(@PathVariable Long configId) {
        CardDisplayConfigResponseDto response = cardDisplayService.getCardDisplayConfigById(configId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/card-display-config/by-profile-id/{profileId}")
    public ResponseEntity<CardDisplayConfigResponseDto> getCardDisplayConfigByProfileId(@PathVariable Long profileId) {
        CardDisplayConfigResponseDto response = cardDisplayService.getCardDisplayConfigByProfileId(profileId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/card-display-configs")
    public ResponseEntity<Page<CardDisplayConfigResponseDto>> getCardDisplayConfigs(
            @RequestParam(required = false) Long profileId,
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false, defaultValue = "true") Boolean active,
            Pageable pageable) {
        Page<CardDisplayConfigResponseDto> response =
                cardDisplayService.getCardDisplayConfigs(profileId, orgId, serviceId, active, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/card-display-configs/{configId}")
    public ResponseEntity<Void> deleteCardDisplayConfig(@PathVariable Long configId) {
        cardDisplayService.deleteCardDisplayConfig(configId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/card-display-configs/{configId}/fields")
    public ResponseEntity<CardDisplayFieldResponseDto> createCardDisplayField(
            @PathVariable Long configId, @Valid @RequestBody CreateCardDisplayFieldRequestDto request) {
        CardDisplayFieldResponseDto response = cardDisplayService.createCardDisplayField(configId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/card-display-fields/{fieldId}")
    public ResponseEntity<CardDisplayFieldResponseDto> updateCardDisplayField(
            @PathVariable Long fieldId, @Valid @RequestBody UpdateCardDisplayFieldRequestDto request) {
        CardDisplayFieldResponseDto response = cardDisplayService.updateCardDisplayField(fieldId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/card-display-configs/{configId}/fields")
    public ResponseEntity<List<CardDisplayFieldResponseDto>> getCardDisplayFields(
            @PathVariable Long configId, @RequestParam(required = false, defaultValue = "false") Boolean enabledOnly) {
        List<CardDisplayFieldResponseDto> response = cardDisplayService.getCardDisplayFields(configId, enabledOnly);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/card-display-fields/{fieldId}")
    public ResponseEntity<Void> deleteCardDisplayField(@PathVariable Long fieldId) {
        cardDisplayService.deleteCardDisplayField(fieldId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/card-display-fields/{fieldId}/position")
    public ResponseEntity<CardDisplayFieldResponseDto> updateCardDisplayFieldPosition(
            @PathVariable Long fieldId, @Valid @RequestBody UpdateCardDisplayFieldPositionRequestDto request) {
        CardDisplayFieldResponseDto response = cardDisplayService.updateCardDisplayFieldPosition(fieldId, request);
        return ResponseEntity.ok(response);
    }
}
