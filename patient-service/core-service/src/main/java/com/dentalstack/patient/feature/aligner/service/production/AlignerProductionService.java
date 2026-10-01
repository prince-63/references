package com.dentalstack.patient.feature.aligner.service.production;

import com.dentalstack.patient.feature.aligner.dto.aligner.production.UpdateAlignerProductionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.AddAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.DeleteAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.UpdateAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionOrderLog;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import jakarta.annotation.Nullable;
import java.util.List;
import java.util.Set;

public interface AlignerProductionService {
    AlignerJourney updateAlignerProduction(UpdateAlignerProductionRequest request);

    void updateAlignerProduction(
            AlignerJourney alignerJourney,
            Set<Integer> alignerNos,
            @Nullable ProductionSubStatus subStatus,
            @Nullable Long productionLabId);

    List<AlignerProductionOrderLog> getAlignerProductionOrderUpdateLogs(Long alignerJourneyId);

    AlignerJourney addAlignerProductionOrderReminder(AddAlignerProductionReminderRequest request);

    AlignerJourney deleteAlignerProductionOrderReminder(DeleteAlignerProductionReminderRequest request);

    AlignerJourney updateAlignerProductionOrderReminder(UpdateAlignerProductionReminderRequest request);
}
