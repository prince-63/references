package com.dentalstack.auth.controller.v1;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.dto.auth.RefreshTokenRequest;
import com.dentalstack.auth.dto.token.ValidateTokenRequest;
import com.dentalstack.auth.service.AuthServiceV2;
import com.dentalstack.auth.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/token/v1")
@SecurityRequirement(name = "bearer-jwt")
public class TokenController {

    private final TokenService tokenService;
    private final AuthServiceV2 authService;

    @PostMapping("/validate")
    @Operation(summary = "Validate the auth token")
    public ResponseEntity<Boolean> validateToken(@RequestBody ValidateTokenRequest request) {
        return ResponseEntity.ok(tokenService.validateToken(request));
    }

    @PostMapping("/token/refresh")
    @Operation(summary = "Refresh token")
    public ResponseEntity<AuthDetails> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok((authService.refreshToken(request, xOrgName)));
    }
}
