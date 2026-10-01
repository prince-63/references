package com.dentalstack.patient.feature.chat.dto.request;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetMyChatsRequest {
    private Long profileId;
    private int page;
    private int size;
    private String search;
    private List<Long> customerIds;
}
