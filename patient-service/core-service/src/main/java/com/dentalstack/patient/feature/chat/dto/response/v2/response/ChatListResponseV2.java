package com.dentalstack.patient.feature.chat.dto.response.v2.response;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatListResponseV2 {

    private List<ChatResponseV2> chats;
    private PaginationDetails paginationDetails;
}
