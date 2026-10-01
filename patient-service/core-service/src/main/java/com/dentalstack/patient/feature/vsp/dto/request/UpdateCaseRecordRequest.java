package com.dentalstack.patient.feature.vsp.dto.request;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class UpdateCaseRecordRequest {

    private Long caseRecordId;
    private Long caseId;
    private Long patientId;

    private List<Long> extraoralPhotoFileIds = new ArrayList<>();
    private List<Long> intraoralPhotoFileIds = new ArrayList<>();
    private List<Long> intraoralScanFileIds = new ArrayList<>();
    private List<Long> stoneCastFileIds = new ArrayList<>();
    private List<Long> dicomFileIds = new ArrayList<>();
    private List<Long> radioGrapFileIds = new ArrayList<>();

    private List<Long> removeFileIds = new ArrayList<>();

    private List<String> externalLinks = new ArrayList<>();
}
