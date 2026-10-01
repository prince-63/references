package com.dentalstack.patient.feature.aligner.service.production;

import com.dentalstack.patient.feature.aligner.dto.aligner.production.lab.AddAlignerProductionLabRequest;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import jakarta.annotation.Nullable;
import java.util.List;

public interface AlignerProductionLabService {

    void autoFillDefaultLabs();

    List<AlignerProductionLab> getLabs(@Nullable Long doctorId, Boolean isDefault);

    AlignerProductionLab addAlignerProductionLab(AddAlignerProductionLabRequest request);
}
