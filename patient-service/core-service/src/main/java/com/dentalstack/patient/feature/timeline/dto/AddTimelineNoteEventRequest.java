package com.dentalstack.patient.feature.timeline.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AddTimelineNoteEventRequest {

    private long doctorId;

    private long patientId;

    private String note;

    private String title;
}
