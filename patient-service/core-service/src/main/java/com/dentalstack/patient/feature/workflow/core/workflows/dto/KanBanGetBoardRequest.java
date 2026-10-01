package com.dentalstack.patient.feature.workflow.core.workflows.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KanBanGetBoardRequest {
    private Long organizationId;
    private Long profileId;
    private String kanbanName;
    private String kanbanHeaderName;
}
