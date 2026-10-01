package com.dentalstack.patient.feature.timeline.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerChangeUpdates {
    private List<AlignerChangeUpdate> alignerChanges = new ArrayList<>();
}
