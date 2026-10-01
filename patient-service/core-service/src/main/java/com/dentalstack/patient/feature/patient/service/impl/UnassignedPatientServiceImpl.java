package com.dentalstack.patient.feature.patient.service.impl;

import com.dentalstack.patient.feature.patient.dto.RegisterPatientRequest;
import com.dentalstack.patient.feature.patient.entity.PatientLead;
import com.dentalstack.patient.feature.patient.repository.PatientLeadRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.UnassignedPatientService;
import java.text.SimpleDateFormat;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UnassignedPatientServiceImpl implements UnassignedPatientService {

    private final PatientLeadRepository patientLeadRepository;

    private final PatientRepository patientRepository;

    private String generateUUID() {
        String uuid;
        do {
            String timeStamp = new SimpleDateFormat("ddHHmmss").format(new Date());
            uuid = "P" + timeStamp;
        } while (patientRepository.findByUUID(uuid).isPresent());
        return uuid;
    }

    @Override
    public PatientLead registerPatient(RegisterPatientRequest request) {
        String uuid = generateUUID();
        if (request.getMobile() != null) {
            var optionalPatient = patientLeadRepository.findByMobileNo(request.getMobile());
            if (optionalPatient.isPresent()) {
                return optionalPatient.get();
            }
        }

        PatientLead patient = PatientLead.from(request, uuid);

        return patientLeadRepository.save(patient);
    }
}
