package com.dentalstack.patient.feature.auth.client;

import com.dentalstack.patient.feature.auth.dto.auth.UpdateAuthRequest;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "auth-service",
        url = "${spring.cloud.openfeign.client.config.auth-service.url}",
        fallback = AuthServiceClientFallback.class)
public interface AuthServiceClient {

    @PutMapping("/auth/v1/update")
    void updateAuthPatient(@Valid @RequestBody UpdateAuthRequest request);

    @PostMapping("/auth/patient/v1/delete/{UUID}")
    void deleteByUUID(@PathVariable("UUID") String UUID);

    @DeleteMapping("/auth/patient/v1/delete/{email}")
    void deleteByEmail(@PathVariable("email") String email);

    @GetMapping("/auth/v1/admin/organization/validate")
    boolean validateOrganizationCredentials(
            @RequestHeader("X-Organization-Name") String orgName,
            @RequestHeader("X-Organization-Token") String orgToken);

    @GetMapping("/auth/v1/check-with-email/{email}")
    @Operation(summary = "Check user is present with email")
    boolean checkWithEmail(@PathVariable(value = "email") String email);
}
