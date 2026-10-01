package com.dentalstack.patient.feature.workflow.card_display.service;

import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.flag.util.FlagSeedData;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.card_display.dto.*;
import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayConfig;
import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayField;
import com.dentalstack.patient.feature.workflow.card_display.enums.DisplayTypeEnum;
import com.dentalstack.patient.feature.workflow.card_display.repository.CardDisplayConfigRepository;
import com.dentalstack.patient.feature.workflow.card_display.repository.CardDisplayFieldRepository;
import com.dentalstack.patient.feature.workflow.card_display.util.CardDisplayFieldSeedData;
import com.dentalstack.patient.feature.workflow.core.workflows.mapper.WorkflowManagementMapper;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowCardDisplayFieldMetadata;
import com.dentalstack.patient.feature.workflow.product.repository.ProductCategoryRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.feature.workflow.product.util.ServiceProductSeedData;
import com.dentalstack.patient.global.exception.GenericException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CardDisplayServiceImpl implements CardDisplayService {

    private final ServiceProductRepository serviceProductRepository;
    private final CardDisplayConfigRepository cardDisplayConfigRepository;
    private final CardDisplayFieldRepository cardDisplayFieldRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkflowManagementMapper mapper;
    private final ProductCategoryRepository productCategoryRepository;
    private final FlagSeedData flagSeedData;
    private final ServiceProductSeedData serviceProductSeedData;
    private final GDrivePlatformProvider gDrivePlatformProvider;
    private final GoogleDriveService googleDriveService;

    @Override
    public void createCardDisplayConfig(CreateCardDisplayConfigRequestDto request) {
        UserProfile userProfile = userProfileRepository
                .findUserProfileDetails(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        CardDisplayConfig cardDisplayConfig = cardDisplayConfigRepository.findByUserProfileId(request.getProfileId());
        flagSeedData.getFlagSeedData(userProfile);
        serviceProductSeedData.seedServiceProductForGrowthUser(userProfile);
        if (userProfile.getProfileType().equals(ProfileType.INVITED)) {
            Long doctorId = userProfile.getInviterProfile().getDoctor().getId();
            Long profileId = userProfile.getInviterProfile().getId();
            if (gDrivePlatformProvider.isGDrivePlatformEnabled(doctorId, profileId)) {
                List<String> emails = userProfileRepository.findAdminEmails(userProfile.getId());
                try {
                    googleDriveService.shareFile(profileId, "patient", emails, "reader", null);
                } catch (Exception ignored) {

                }
            }
        }
        if (cardDisplayConfig != null) {
            return;
        }
        CardDisplayConfig config = new CardDisplayConfig();
        final CardDisplayConfig parent = config;
        List<CardDisplayField> fields = CardDisplayFieldSeedData.getSeedFields(userProfile);
        fields.forEach(f -> f.setConfig(parent));
        config.setCardDisplayFields(fields);
        config.setActive(true);
        config.setUserProfile(userProfile);
        config.setOrgId(userProfile.getOrganization().getId());
        cardDisplayConfigRepository.save(config);
    }

    @Override
    public CardDisplayConfigResponseDto getCardDisplayConfigByProfileId(Long profileId) {
        CardDisplayConfig config = cardDisplayConfigRepository.findByUserProfileId(profileId);
        return mapper.toCardDisplayConfigResponseDto(config);
    }

    @Override
    public CardDisplayConfigResponseDto updateCardDisplayConfig(
            Long configId, UpdateCardDisplayConfigRequestDto request) {

        CardDisplayConfig config = cardDisplayConfigRepository
                .findById(configId)
                .orElseThrow(() -> new GenericException("Card display config not found with id: " + configId));

        config.setName(request.getName());
        config.setActive(request.getActive());
        config.setUpdatedAt(ZonedDateTime.now());

        config = cardDisplayConfigRepository.save(config);
        return mapper.toCardDisplayConfigResponseDto(config);
    }

    @Override
    @Transactional(readOnly = true)
    public CardDisplayConfigResponseDto getCardDisplayConfigById(Long configId) {

        CardDisplayConfig config = cardDisplayConfigRepository
                .findById(configId)
                .orElseThrow(() -> new GenericException("Card display config not found with id: " + configId));

        return mapper.toCardDisplayConfigResponseDto(config);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CardDisplayConfigResponseDto> getCardDisplayConfigs(
            Long profileId, Long orgId, Long serviceId, Boolean active, Pageable pageable) {

        Page<CardDisplayConfig> configs = cardDisplayConfigRepository.findByFilters(profileId, orgId, active, pageable);
        return configs.map(mapper::toCardDisplayConfigResponseDto);
    }

    @Override
    public void deleteCardDisplayConfig(Long configId) {
        cardDisplayConfigRepository.deleteById(configId);
    }

    @Override
    public CardDisplayFieldResponseDto createCardDisplayField(Long configId, CreateCardDisplayFieldRequestDto request) {

        CardDisplayConfig config = cardDisplayConfigRepository
                .findById(configId)
                .orElseThrow(() -> new GenericException("Card display config not found with id: " + configId));

        CardDisplayField field = new CardDisplayField();
        field.setFieldKey(request.getFieldKey());
        field.setLabel(request.getLabel());
        field.setEnabled(request.getEnabled() != null ? request.getEnabled() : false);
        field.setPosition(request.getPosition() != null ? request.getPosition() : 0);
        field.setDisplayType(request.getDisplayType() != null ? request.getDisplayType() : DisplayTypeEnum.TEXT);
        field.setSampleValue(request.getSampleValue());
        field.setShowInPreview(request.getShowInPreview() != null ? request.getShowInPreview() : true);

        WorkFlowCardDisplayFieldMetadata metadata = new WorkFlowCardDisplayFieldMetadata(
                request.getProductType(),
                request.getProductName(),
                request.getCategory(),
                request.getProductDescription(),
                request.getProductImage(),
                request.getProductTag());
        field.setMetadata(metadata);

        field = cardDisplayFieldRepository.save(field);
        return mapper.toCardDisplayFieldResponseDto(field);
    }

    @Override
    public CardDisplayFieldResponseDto updateCardDisplayField(Long fieldId, UpdateCardDisplayFieldRequestDto request) {
        CardDisplayField field = cardDisplayFieldRepository
                .findById(fieldId)
                .orElseThrow(() -> new GenericException("Card display field not found with id: " + fieldId));

        field.setFieldKey(request.getFieldKey() != null ? request.getFieldKey() : field.getFieldKey());
        field.setLabel(request.getLabel() != null ? request.getLabel() : field.getLabel());
        field.setEnabled(request.getEnabled() != null ? request.getEnabled() : field.getEnabled());
        field.setPosition(request.getPosition() != null ? request.getPosition() : field.getPosition());
        field.setDisplayType(request.getDisplayType() != null ? request.getDisplayType() : field.getDisplayType());
        field.setSampleValue(request.getSampleValue() != null ? request.getSampleValue() : field.getSampleValue());
        field.setShowInPreview(
                request.getShowInPreview() != null ? request.getShowInPreview() : field.getShowInPreview());
        field.setUpdatedAt(ZonedDateTime.now());

        field = cardDisplayFieldRepository.save(field);
        return mapper.toCardDisplayFieldResponseDto(field);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardDisplayFieldResponseDto> getCardDisplayFields(Long configId, Boolean enabledOnly) {

        List<CardDisplayField> fields;
        if (enabledOnly != null && enabledOnly) {
            fields = cardDisplayFieldRepository.findByConfig_IdAndEnabledTrueOrderByPosition(configId);
        } else {
            fields = cardDisplayFieldRepository.findByConfig_IdOrderByPosition(configId);
        }

        return fields.stream().map(mapper::toCardDisplayFieldResponseDto).collect(Collectors.toList());
    }

    @Override
    public void deleteCardDisplayField(Long fieldId) {
        cardDisplayFieldRepository.deleteById(fieldId);
    }

    @Override
    public CardDisplayFieldResponseDto updateCardDisplayFieldPosition(
            Long fieldId, UpdateCardDisplayFieldPositionRequestDto request) {

        CardDisplayField field = cardDisplayFieldRepository
                .findById(fieldId)
                .orElseThrow(() -> new GenericException("Card display field not found with id: " + fieldId));

        Integer oldPosition = field.getPosition();
        Integer newPosition = request.getPosition();

        if (oldPosition.equals(newPosition)) {
            return mapper.toCardDisplayFieldResponseDto(field);
        }

        List<CardDisplayField> allFields = cardDisplayFieldRepository.findByConfig_IdOrderByPositionAsc(
                field.getConfig().getId());

        if (newPosition < oldPosition) {
            for (CardDisplayField otherField : allFields) {
                if (!otherField.getId().equals(fieldId)
                        && otherField.getPosition() >= newPosition
                        && otherField.getPosition() < oldPosition) {
                    otherField.setPosition(otherField.getPosition() + 1);
                    otherField.setUpdatedAt(ZonedDateTime.now());
                }
            }
        } else {
            for (CardDisplayField otherField : allFields) {
                if (!otherField.getId().equals(fieldId)
                        && otherField.getPosition() > oldPosition
                        && otherField.getPosition() <= newPosition) {
                    otherField.setPosition(otherField.getPosition() - 1);
                    otherField.setUpdatedAt(ZonedDateTime.now());
                }
            }
        }

        field.setPosition(newPosition);
        field.setUpdatedAt(ZonedDateTime.now());

        cardDisplayFieldRepository.saveAll(allFields);
        field = cardDisplayFieldRepository.save(field);

        return mapper.toCardDisplayFieldResponseDto(field);
    }
}
