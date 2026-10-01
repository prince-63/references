package com.dentalstack.patient.feature.workflow.card_display.service;

import com.dentalstack.patient.feature.workflow.card_display.dto.*;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CardDisplayService {

    void createCardDisplayConfig(CreateCardDisplayConfigRequestDto request);

    CardDisplayConfigResponseDto getCardDisplayConfigByProfileId(Long profileId);

    CardDisplayConfigResponseDto updateCardDisplayConfig(Long configId, UpdateCardDisplayConfigRequestDto request);

    CardDisplayConfigResponseDto getCardDisplayConfigById(Long configId);

    Page<CardDisplayConfigResponseDto> getCardDisplayConfigs(
            Long profileId, Long orgId, Long serviceId, Boolean active, Pageable pageable);

    void deleteCardDisplayConfig(Long configId);

    CardDisplayFieldResponseDto createCardDisplayField(Long configId, CreateCardDisplayFieldRequestDto request);

    CardDisplayFieldResponseDto updateCardDisplayField(Long fieldId, UpdateCardDisplayFieldRequestDto request);

    List<CardDisplayFieldResponseDto> getCardDisplayFields(Long configId, Boolean enabledOnly);

    void deleteCardDisplayField(Long fieldId);

    CardDisplayFieldResponseDto updateCardDisplayFieldPosition(
            Long fieldId, UpdateCardDisplayFieldPositionRequestDto request);
}
