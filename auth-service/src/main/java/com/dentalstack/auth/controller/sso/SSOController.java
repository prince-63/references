package com.dentalstack.auth.controller.sso;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.service.AuthServiceV2;
import com.dentalstack.auth.service.DoctorLoginService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/v1/sso")
public class SSOController {

    private final AuthServiceV2 authServiceV2;
    private final DoctorLoginService doctorLoginService;

    @GetMapping("/login/{email}/{auth_token}")
    @Operation(summary = "login sso user")
    public ResponseEntity<AuthDetails> ssoUserLogin(
            @PathVariable(value = "email") String email, @PathVariable(value = "auth_token") String token) {
        return ResponseEntity.ok((authServiceV2.ssoUserLogin(email, token)));
    }

    //    @PostMapping("/signup")
    //    @Operation(summary = "Sign up a new SSO user")
    //    public ResponseEntity<AuthDetails> ssoUserSignUp(@Valid @RequestBody SsoUserSignUpRequest request) {
    //        return ResponseEntity.ok((doctorLoginService.ssoUserSignUp(request)));
    //    }

    @GetMapping("/sync/users")
    @Operation(summary = "Sync the new signed up users")
    public ResponseEntity<List<AuthDetails>> ssoActiveUsers(
            @RequestParam("org_name") String orgName, @RequestParam("last_sync_auth_id") Long lastSyncAuthId) {

        List<AuthDetails> response = doctorLoginService.ssoActiveUsers(orgName, lastSyncAuthId);
        return ResponseEntity.ok(response);
    }
}
