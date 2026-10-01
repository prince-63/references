package com.dentalstack.auth.service.apple;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppleIdToken {
    private String idToken;
    private UserData userData;
}
