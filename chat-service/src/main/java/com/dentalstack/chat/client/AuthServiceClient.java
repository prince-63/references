package com.dentalstack.chat.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

    @GetMapping("/auth/doctor/v1/check/login/auth-type/{email}")
    boolean loginAuthTypeCheck(@PathVariable(value = "email") String email);

    @GetMapping("/auth/v1/admin/organization/validate")
    boolean validateOrganizationCredentials(
            @RequestHeader("X-Organization-Name") String orgName,
            @RequestHeader("X-Organization-Token") String orgToken);
}
