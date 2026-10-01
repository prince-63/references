package com.dentalstack.auth.dto;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JWTToken {
    private String token;
    private ZonedDateTime expireAt;
}
