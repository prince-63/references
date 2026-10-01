package com.dentalstack.patient.feature.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileInfoResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String organizationName;
    private String profilePictureUrl;
    private Long profileImageId;
    private String roleName;
}
