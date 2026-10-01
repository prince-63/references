package com.dentalstack.chat.dto.chat;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class GetChatDetailsRequest {

    private Long doctorId;

    private Long organizationId;
    private Long profileId;
}
