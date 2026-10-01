package com.dentalstack.patient.feature.caseinfo.service;

import com.dentalstack.patient.feature.caseinfo.dto.AnchorTypeAddRequest;
import com.dentalstack.patient.feature.caseinfo.dto.RetentionTypeAddRequest;
import com.dentalstack.patient.feature.caseinfo.entity.AnchorType;
import com.dentalstack.patient.feature.caseinfo.entity.RetentionType;
import com.dentalstack.patient.feature.caseinfo.repository.AnchorTypeRepository;
import com.dentalstack.patient.feature.caseinfo.repository.RetentionTypeRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnchorTypeServiceImpl implements AnchorTypeService {

    private final AnchorTypeRepository anchorTypeRepository;
    private final RetentionTypeRepository retentionTypeRepository;

    @Override
    public List<AnchorType> getAnchorTypeForDoctor(Long doctorId) {
        List<AnchorType> anchorTypesResponse = new ArrayList<>();
        List<AnchorType> anchorTypes = anchorTypeRepository.findByDoctorId(doctorId);
        List<AnchorType> commonAnchorTypes = anchorTypeRepository.findByIsCommonTrue();

        anchorTypesResponse.addAll(anchorTypes);

        anchorTypesResponse.addAll(commonAnchorTypes);

        return anchorTypesResponse;
    }

    @Override
    public List<RetentionType> getRetentionTypeForDoctor(Long doctorId) {
        List<RetentionType> retentionTypesResponse = new ArrayList<>();
        List<RetentionType> retentionTypes = retentionTypeRepository.findByDoctorId(doctorId);
        List<RetentionType> commonRetentionTypes = retentionTypeRepository.findByIsCommonTrue();

        retentionTypesResponse.addAll(retentionTypes);

        retentionTypesResponse.addAll(commonRetentionTypes);

        return retentionTypesResponse;
    }

    @Override
    public void addRetention(RetentionTypeAddRequest request) {
        RetentionType type = RetentionType.builder()
                .doctorId(request.getDoctorId())
                .jawType(request.getJawType())
                .value(request.getValue())
                .isCommon(false)
                .build();
        retentionTypeRepository.save(type);
    }

    @Override
    public void addAnchorType(AnchorTypeAddRequest request) {
        AnchorType type = AnchorType.builder()
                .doctorId(request.getDoctorId())
                .jawType(request.getJawType())
                .value(request.getValue())
                .isCommon(false)
                .build();
        anchorTypeRepository.save(type);
    }
}
