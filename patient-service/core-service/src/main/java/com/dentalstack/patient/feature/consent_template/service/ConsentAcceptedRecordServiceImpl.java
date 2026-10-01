package com.dentalstack.patient.feature.consent_template.service;

import com.dentalstack.patient.feature.consent_template.dto.*;
import com.dentalstack.patient.feature.consent_template.entity.ConsentAcceptedRecord;
import com.dentalstack.patient.feature.consent_template.entity.ConsentTemplate;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateType;
import com.dentalstack.patient.feature.consent_template.exception.ConsentTemplateNotFoundException;
import com.dentalstack.patient.feature.consent_template.repository.ConsentAcceptedRecordRepository;
import com.dentalstack.patient.feature.consent_template.repository.ConsentTemplateRepository;
import com.dentalstack.patient.feature.notification.service.ConsentEmailService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.utils.StringUtil;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@AllArgsConstructor
public class ConsentAcceptedRecordServiceImpl implements ConsentAcceptedRecordService {

    private final ConsentAcceptedRecordRepository consentAcceptedRecordRepository;
    private final ConsentTemplateRepository consentTemplateRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientRepository patientRepository;
    private final ConsentEmailService consentEmailService;
    private final StringUtil stringUtil;

    @Override
    @Transactional
    public void customerConsentAccept(ConsentAcceptRequest request, MultipartFile file) {
        UserProfile fromUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getFromProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getFromProfileId()));
        UserProfile toUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getToProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getToProfileId()));
        ConsentTemplate template = consentTemplateRepository
                .findById(request.getTemplateId())
                .orElseThrow(() -> new ConsentTemplateNotFoundException(request.getTemplateId()));
        var record = ConsentAcceptedRecord.builder()
                .acceptedFrom(fromUserProfile)
                .acceptedBy(toUserProfile)
                .consentTemplate(template)
                .content(request.getContent())
                .build();
        consentAcceptedRecordRepository.save(record);

        consentEmailService.sendConsentAcceptEmail(
                toUserProfile.getUser().fullNameWithSalutation(),
                stringUtil.toReadableString(ConsentTemplateType.CUSTOMER.name()),
                toUserProfile.getOrgName(),
                toUserProfile.getUser().getEmail(),
                file);

        consentEmailService.sendConsentCopyToAdmin(
                toUserProfile.getUser().fullNameWithSalutation(),
                stringUtil.toReadableString(ConsentTemplateType.CUSTOMER.name()),
                fromUserProfile.getOrgName(),
                fromUserProfile.getUser().getEmail(),
                file);
    }

    @Override
    @Transactional
    public void patientConsentAccept(ConsentAcceptRequest request, MultipartFile file) {
        UserProfile fromUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getFromProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getFromProfileId()));
        Patient patient = patientRepository
                .findById(request.getToPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getToPatientId()));
        ConsentTemplate template = consentTemplateRepository
                .findById(request.getTemplateId())
                .orElseThrow(() -> new ConsentTemplateNotFoundException(request.getTemplateId()));
        var record = ConsentAcceptedRecord.builder()
                .acceptedFrom(fromUserProfile)
                .acceptedByPatient(patient)
                .consentTemplate(template)
                .content(request.getContent())
                .build();
        consentAcceptedRecordRepository.save(record);
        consentEmailService.sendConsentAcceptEmail(
                patient.fullName(),
                stringUtil.toReadableString(ConsentTemplateType.PATIENT.name()),
                fromUserProfile.getOrgName(),
                patient.getEmail(),
                file);
        consentEmailService.sendConsentCopyToAdmin(
                patient.fullName(),
                stringUtil.toReadableString(ConsentTemplateType.PATIENT.name()),
                fromUserProfile.getOrgName(),
                patient.getEmail(),
                file);
    }

    @Override
    public GetConsentAcceptedRecordsResponse getConsentsAcceptedForPatient(GetConsentAcceptedRecordsRequest request) {
        List<ConsentAcceptedRecord> templates =
                consentAcceptedRecordRepository.findByPatient(request.getFromProfileId(), request.getToPatientId());
        return GetConsentAcceptedRecordsResponse.builder()
                .data(templates.stream().map(ConsentAcceptedRecordDetails::from).toList())
                .build();
    }

    @Override
    public GetConsentAcceptedRecordsResponse getConsentsAcceptedForCustomer(GetConsentAcceptedRecordsRequest request) {
        List<ConsentAcceptedRecord> templates =
                consentAcceptedRecordRepository.findByCustomer(request.getFromProfileId(), request.getToProfileId());
        return GetConsentAcceptedRecordsResponse.builder()
                .data(templates.stream().map(ConsentAcceptedRecordDetails::from).toList())
                .build();
    }
}
