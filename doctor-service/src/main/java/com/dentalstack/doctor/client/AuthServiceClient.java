package com.dentalstack.doctor.client;

import com.dentalstack.doctor.dto.AccountPasswordValidateRequest;
import com.dentalstack.doctor.dto.auth.FetchLoginType;
import com.dentalstack.doctor.enums.auth.CredentialType;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    @PostMapping("/auth/v2/fetch-login-type")
    CredentialType fetchLoginType(@RequestBody FetchLoginType request);

    @GetMapping("/auth/v1/admin/organization/validate")
    boolean validateOrganizationCredentials(
            @RequestHeader("X-Organization-Name") String orgName,
            @RequestHeader("X-Organization-Token") String orgToken);

    @GetMapping("/auth/v1/check-with-email/{email}")
    @Operation(summary = "Check user is present with email")
    boolean checkWithEmail(@PathVariable(value = "email") String email);

    @GetMapping("/auth/v2/check-with-email")
    @Operation(summary = "Check user is present with email")
    boolean checkWithEmailAndOrgIdAndXOrgName(
            @RequestParam(value = "email") String email,
            @RequestParam(value = "organizationId") Long organizationId,
            @RequestParam("xOrgName") String xOrgName);

    @PostMapping("/auth/v2/validate/password")
    List<Long> findMatchingAccount(@RequestBody AccountPasswordValidateRequest request);
}
