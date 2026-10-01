package com.dentalstack.patient.feature.treatment.dto.action;

import com.dentalstack.patient.global.enums.UserType;
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
