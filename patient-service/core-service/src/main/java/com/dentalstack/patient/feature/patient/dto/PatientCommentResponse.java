package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.order.entity.OrderComments;
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
public class PatientCommentResponse implements TimeStamped {
    private Long doctorId;
    private Long profileId;
    private String notes;
    private String profileImageUrl;
    private String displayName;
    private ZonedDateTime createdAt;
    private String remark;
    private List<FileDetails> files;
    private Long commentId;

    public static PatientCommentResponse from(OrderComments comments) {
        return PatientCommentResponse.builder()
                .doctorId(comments.getDoctorId())
                .profileId(comments.getProfileId())
                .notes(comments.getNotes())
                .profileImageUrl(
                        comments.getAddedBy() != null
                                ? comments.getAddedBy().getUser().getProfileUrl()
                                : null)
                .displayName(
                        comments.getAddedBy() != null
                                ? comments.getAddedBy().getUser().fullNameWithSalutation()
                                : null)
                .createdAt(comments.getCreatedAt())
                .remark(comments.getRemark())
                .files(comments.getFiles().stream().map(FileDetails::from).toList())
                .commentId(comments.getId())
                .build();
    }

    @Override
    public ZonedDateTime getTimestamp() {
        return createdAt;
    }
}
