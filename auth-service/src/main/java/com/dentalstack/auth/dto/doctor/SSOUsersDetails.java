package com.dentalstack.auth.dto.doctor;

import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SSOUsersDetails {
    private String orgName;
    private List<SSOUserInfo> users;
    private Long totalUsers;
    private Long lastSyncedUserId;
    private ZonedDateTime syncTime;
    private Boolean hasMore;

    @Data
    @Builder
    public static class SSOUserInfo {
        private Long userId;
        private String email;
        private String mobileNo;
        private String firstName;
        private String lastName;
        private String salutation;
        private ZonedDateTime createdAt;
    }
}
