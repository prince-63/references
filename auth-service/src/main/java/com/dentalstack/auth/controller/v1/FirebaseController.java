package com.dentalstack.auth.controller.v1;

import com.dentalstack.auth.dto.firebase.FirebaseRequest;
import com.dentalstack.auth.service.FirebaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/firebase/v1")
@SecurityRequirement(name = "bearer-jwt")
public class FirebaseController {

    private final FirebaseService firebaseService;

    @PostMapping("/token")
    @Operation(summary = "Add firebase token")
    public ResponseEntity<String> updateToken(@RequestBody FirebaseRequest request) {
        return ResponseEntity.ok(firebaseService.addToken(request));
    }

    @GetMapping("/token")
    @Operation(summary = "Get firebase token")
    public ResponseEntity<String> fetchToken(@RequestParam String email) {
        return ResponseEntity.ok((firebaseService.getToken(email)));
    }
}
