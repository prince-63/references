package com.dentalstack.auth.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(
        name = "Google-firebase-jwks-client",
        url = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
public interface GoogleFirebaseJwksClient {
    @GetMapping("/")
    Map<String, String> getPublicKey();
}
