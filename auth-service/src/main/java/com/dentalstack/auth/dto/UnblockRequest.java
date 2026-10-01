package com.dentalstack.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnblockRequest {
    @NotNull(message = "Email cannot be null")
    @Email(message = "Email should be valid")
    private String email;
}
