package com.dentalstack.patient.feature.consent_template.service;

import com.dentalstack.patient.feature.consent_template.dto.*;
import com.dentalstack.patient.feature.consent_template.entity.ConsentTemplate;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateLocation;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateType;
import com.dentalstack.patient.feature.consent_template.repository.ConsentTemplateRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
class ConsentTemplateServiceImpl implements ConsentTemplateService {

    private final ConsentTemplateRepository consentTemplateRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientRepository patientRepository;

    private UserProfile getUserProfileById(Long userProfileId) {
        return userProfileRepository
                .findById(userProfileId)
                .orElseThrow(() -> new UserNotFoundException(userProfileId));
    }

    @Override
    @Transactional
    public ConsentTemplateDetails addConsent(AddConsentTemplateRequest request) {
        UserProfile userProfile = getUserProfileById(request.getProfileId());
        var existingDefault = consentTemplateRepository.findDefaultByProfileTypeAndLocation(
                request.getProfileId(), request.getType(), request.getLocation());

        boolean shouldBeDefault;
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            consentTemplateRepository.updateExistingTemplateDefaultStatus(
                    request.getProfileId(), request.getType(), request.getLocation());
            shouldBeDefault = true;
        } else {
            shouldBeDefault = existingDefault.isEmpty();
        }

        ConsentTemplate consentTemplate = request.toEntity(userProfile);
        consentTemplate.setIsDefault(shouldBeDefault);
        consentTemplate.setIsActive(request.getIsActive() == null ? Boolean.TRUE : request.getIsActive());
        consentTemplate.setUserProfile(userProfile);

        ConsentTemplate saved = consentTemplateRepository.save(consentTemplate);
        return ConsentTemplateDetails.from(saved);
    }

    @Override
    @Transactional
    public ConsentTemplateDetails updateConsent(Long id, AddConsentTemplateRequest request) {
        UserProfile userProfile = getUserProfileById(request.getProfileId());
        ConsentTemplate consentTemplate = consentTemplateRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Consent Template not found with id: " + id));

        boolean wasDefault = Boolean.TRUE.equals(consentTemplate.getIsDefault());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            consentTemplateRepository.updateExistingTemplateDefaultStatus(
                    request.getProfileId(), request.getType(), request.getLocation());
            consentTemplate.setIsDefault(true);
        } else if (request.getIsDefault() != null && !request.getIsDefault()) {
            consentTemplate.setIsDefault(false);
        }

        consentTemplate.setName(request.getName());
        consentTemplate.setTitle(request.getTitle());
        consentTemplate.setContent(request.getContent());
        consentTemplate.setIsActive(
                request.getIsActive() != null ? request.getIsActive() : consentTemplate.getIsActive());
        consentTemplate.setPlaceholders(request.getPlaceholders());
        consentTemplate.setType(request.getType());
        consentTemplate.setLocation(request.getLocation());
        consentTemplate.setUserProfile(userProfile);

        ConsentTemplate updated = consentTemplateRepository.save(consentTemplate);

        if (wasDefault && Boolean.FALSE.equals(request.getIsDefault())) {
            var maybeDefault = consentTemplateRepository.findDefaultByProfileTypeAndLocation(
                    request.getProfileId(), request.getType(), request.getLocation());
            if (maybeDefault.isEmpty()) {
                var fallback =
                        consentTemplateRepository.findFirstByUserProfileIdAndTypeAndLocationAndIsActiveTrueOrderByIdAsc(
                                request.getProfileId(), request.getType(), request.getLocation());
                fallback.ifPresent(f -> {
                    f.setIsDefault(true);
                    consentTemplateRepository.save(f);
                });
            }
        }

        return ConsentTemplateDetails.from(updated);
    }

    @Override
    @Transactional
    public void deleteConsent(Long templateId) {
        ConsentTemplate consentTemplate = consentTemplateRepository
                .findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Consent Template not found with id: " + templateId));

        boolean wasDefault = Boolean.TRUE.equals(consentTemplate.getIsDefault());
        ConsentTemplateType type = consentTemplate.getType();
        ConsentTemplateLocation location = consentTemplate.getLocation();
        Long profileId = consentTemplate.getUserProfile().getId();

        consentTemplate.setIsActive(false);
        consentTemplate.setIsDefault(false);
        consentTemplateRepository.save(consentTemplate);

        if (wasDefault) {
            var fallback =
                    consentTemplateRepository.findFirstByUserProfileIdAndTypeAndLocationAndIsActiveTrueOrderByIdAsc(
                            profileId, type, location);
            fallback.ifPresent(f -> {
                f.setIsDefault(true);
                consentTemplateRepository.save(f);
            });
        }
    }

    @Override
    public ConsentTemplateListResponse getAllConsents(ConsentTemplateRequest request) {
        UserProfile userProfile = getUserProfileById(request.getProfileId());
        List<ConsentTemplate> consentTemplates = consentTemplateRepository.findByUserProfileAndType(
                userProfile.getId(), request.getConsentTemplateType());
        return ConsentTemplateListResponse.builder()
                .data(consentTemplates.stream()
                        .map(ConsentTemplateDetails::from)
                        .toList())
                .build();
    }

    @Override
    public ConsentTemplateDetails getDefaultConsent(GetDefaultConsentRequest request) {
        var maybeDefault = consentTemplateRepository.findDefaultByProfileTypeAndLocation(
                request.getFromProfileId(), request.getType(), request.getLocation());
        if (maybeDefault.isPresent()) {
            ConsentTemplate consentTemplate = maybeDefault.get();
            if (request.getToProfileId() != null) {
                return getConsentTemplateForCustomer(request, consentTemplate);
            } else {
                return getConsentTemplateForPatient(request, consentTemplate);
            }
        }
        return null;
    }

    private ConsentTemplateDetails getConsentTemplateForCustomer(
            GetDefaultConsentRequest request, ConsentTemplate consentTemplate) {
        UserProfile customerProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getToProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getToProfileId()));
        UserProfile ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getFromProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getFromProfileId()));

        String content = consentTemplate.getContent();
        JsonNode templatePlaceholders = consentTemplate.getPlaceholders();

        if (templatePlaceholders != null && templatePlaceholders.isObject()) {
            if (templatePlaceholders.has("name")) {
                content = content.replace("{{name}}", customerProfile.getUser().displayName());
            }
            if (templatePlaceholders.has("doctorName")) {
                content =
                        content.replace("{{doctorName}}", ownerProfile.getUser().displayName());
            }
            if (templatePlaceholders.has("email_to")) {
                content = content.replace(
                        "{{email_to}}", customerProfile.getUser().getEmail());
            }
            if (templatePlaceholders.has("email_from")) {
                content =
                        content.replace("{{email_from}}", ownerProfile.getUser().getEmail());
            }
            if (templatePlaceholders.has("phone_from") && ownerProfile.getUser().getMobileNo() != null) {
                content =
                        content.replace("{{phone_from}}", ownerProfile.getUser().getMobileNo());
            }
            if (templatePlaceholders.has("date")) {
                content = content.replace(
                        "{{date}}", consentTemplate.getCreatedAt().toLocalDate().toString());
            }
        }

        return ConsentTemplateDetails.from(consentTemplate, content);
    }

    private ConsentTemplateDetails getConsentTemplateForPatient(
            GetDefaultConsentRequest request, ConsentTemplate consentTemplate) {
        UserProfile ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getFromProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getFromProfileId()));
        Patient patient = patientRepository.findByPatientId(request.getPatientId());

        String content = consentTemplate.getContent();
        JsonNode templatePlaceholders = consentTemplate.getPlaceholders();

        if (templatePlaceholders != null && templatePlaceholders.isObject()) {
            if (templatePlaceholders.has("name")) {
                content = content.replace("{{name}}", patient.fullName());
            }
            if (templatePlaceholders.has("doctorName")) {
                content =
                        content.replace("{{doctorName}}", ownerProfile.getUser().displayName());
            }
            if (templatePlaceholders.has("email_to") && patient.getEmail() != null) {
                content = content.replace("{{email_to}}", patient.getEmail());
            }
            if (templatePlaceholders.has("email_from")) {
                content =
                        content.replace("{{email_from}}", ownerProfile.getUser().getEmail());
            }
            if (templatePlaceholders.has("phone_from") && ownerProfile.getUser().getMobileNo() != null) {
                content =
                        content.replace("{{phone_from}}", ownerProfile.getUser().getMobileNo());
            }
            if (templatePlaceholders.has("date")) {
                content = content.replace(
                        "{{date}}", consentTemplate.getCreatedAt().toLocalDate().toString());
            }
        }

        return ConsentTemplateDetails.from(consentTemplate, content);
    }
}
