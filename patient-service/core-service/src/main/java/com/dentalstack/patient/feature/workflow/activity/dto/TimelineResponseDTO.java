package com.dentalstack.patient.feature.workflow.activity.dto;

import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.TimeStamped;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimelineResponseDTO implements TimeStamped {
    private String type;
    private String title;
    private String description;
    private String createdBy;
    private String profileImageUrl;
    private ZonedDateTime timestamp;
    private List<FileDetails> files;
    private Boolean isCustomActivity;

    @Override
    public ZonedDateTime getTimestamp() {
        return timestamp;
    }
}
