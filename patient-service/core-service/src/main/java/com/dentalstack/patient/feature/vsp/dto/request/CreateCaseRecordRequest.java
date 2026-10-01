package com.dentalstack.patient.feature.vsp.dto.request;

import com.dentalstack.patient.feature.vsp.enums.VspCaseRecordMode;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class CreateCaseRecordRequest {

    @NotNull
    private VspCaseRecordMode recordSelectionMode;

    private List<Long> extraoralPhotoFileIds = new ArrayList<>();

    private List<Long> intraoralPhotoFileIds = new ArrayList<>();

    private List<Long> intraoralScanFileIds = new ArrayList<>();

    private List<Long> stoneCastFileIds = new ArrayList<>();

    private List<Long> dicomFileIds = new ArrayList<>();

    private List<Long> radioGrapFileIds = new ArrayList<>();

    private List<String> externalLinks = new ArrayList<>();
    private String orderId;
    private Long patientId;
    private Long profileId;
}
