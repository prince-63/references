package com.dentalstack.patient.feature.chat.dto.response;

import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CaseTeamResponse {

    private Long id;
    private String teamName;
    private String description;
    private Boolean isActive;
    private Integer memberCount;
    private ZonedDateTime createdAt;

    private UserProfileInfoResponse createdBy;
    private List<UserProfileInfoResponse> members;
}
