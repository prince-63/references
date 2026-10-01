package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.user.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentOnAlignerActionRequest {
    private UserType userType;
    private Long userId;
    private long alignerActionId;
    private String comment;
    private Long replyToComment;
    private Long profileId;
}
