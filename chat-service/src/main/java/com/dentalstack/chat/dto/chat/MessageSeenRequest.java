package com.dentalstack.chat.dto.chat;

import java.util.List;
import lombok.Data;

@Data
public class MessageSeenRequest {

    private List<Long> chatIdList;

    private String roleName;

    private List<Long> eventIdList;
}
