package com.dentalstack.chat.dto.timeline;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InactivateEventsRequest {
    private List<Long> eventIds;
}
