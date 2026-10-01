package com.dentalstack.patient.feature.caseinfo.service;

import com.dentalstack.patient.feature.caseinfo.dto.AnchorTypeAddRequest;
import com.dentalstack.patient.feature.caseinfo.dto.RetentionTypeAddRequest;
import com.dentalstack.patient.feature.caseinfo.entity.AnchorType;
import com.dentalstack.patient.feature.caseinfo.entity.RetentionType;
import java.util.List;

public interface AnchorTypeService {
    List<AnchorType> getAnchorTypeForDoctor(Long doctorId);

    List<RetentionType> getRetentionTypeForDoctor(Long doctorId);

    void addRetention(RetentionTypeAddRequest request);

    void addAnchorType(AnchorTypeAddRequest request);
}
