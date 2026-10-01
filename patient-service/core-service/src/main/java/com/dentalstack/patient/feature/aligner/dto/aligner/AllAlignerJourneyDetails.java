package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllAlignerJourneyDetails {
    private List<AlignerJourneyDetails> alignerJourneys = new ArrayList<>();

    public void addAlignerJourney(AlignerJourney alignerJourney) {
        alignerJourneys.add(AlignerJourneyDetails.from(alignerJourney));
    }
}
