package com.dentalstack.patient.feature.producttype.service;

import com.dentalstack.patient.feature.invitation.dto.AllInvitationDetailsForMobile;
import com.dentalstack.patient.feature.invitation.exception.PatientInvitationNotFoundException;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.producttype.dto.producttype.ProductTypeAddRequest;
import com.dentalstack.patient.feature.treatment.dto.UpdateTreatmentType;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductTypeServiceImpl implements ProductTypeService {

    private final PatientRepository patientRepository;
    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;

    @Override
    public AllInvitationDetailsForMobile addProductTypeToPatient(ProductTypeAddRequest productTypeAddRequest) {
        var patientId = productTypeAddRequest.getPatientId();
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new UserNotFoundException(patientId));
        var productTypeName = productTypeAddRequest.getProductTypeName();
        patient.setProductTypeName(productTypeName);
        patient.setProductTypeNames(Collections.singletonList(productTypeName));

        patientRepository.save(patient);
        var patientInvitationDetails = patientInvitationDetailsRepository.findByPatientId(patient.getId());
        if (patientInvitationDetails.isPresent()) {
            var invitation = patientInvitationDetails.get().getInvitation();
            return AllInvitationDetailsForMobile.from(invitation);
        } else {
            throw new PatientInvitationNotFoundException();
        }
    }

    @Override
    public AllInvitationDetailsForMobile addProductType(UpdateTreatmentType request) {
        var patientId = request.getPatientId();
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        var productTypeName = request.getProductTypeName();
        patient.setProductTypeName(productTypeName);
        patient.setProductTypeNames(Collections.singletonList(productTypeName));

        patient.setTreatmentType(request.getTreatmentType());

        patientRepository.save(patient);
        var patientInvitationDetails = patientInvitationDetailsRepository.findByPatientId(patient.getId());
        if (patientInvitationDetails.isPresent()) {
            var invitation = patientInvitationDetails.get().getInvitation();
            return AllInvitationDetailsForMobile.from(invitation);
        } else {
            throw new PatientInvitationNotFoundException();
        }
    }
}
