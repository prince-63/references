package com.dentalstack.patient.feature.treatment.service;

import com.dentalstack.patient.feature.treatment.dto.AlignerChangeRequest;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.enums.CreationStatus;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public interface AlignerService {

    List<AlignerJourney> getAlignerJourney(
            long patientId,
            List<CreationStatus> creationStatuses,
            List<ProgressStatus> progressStatuses,
            @Nullable Long alignerJourneyId);

    AlignerJourney getAlignerJourney(@NotNull Long alignerJourneyId);

    AlignerJourney manualAlignerChange(AlignerChangeRequest request);

    void processAlignerChanges();

    void updateAlignerProductionStatus();
}
