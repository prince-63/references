package com.dentalstack.auth.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class UrlUtil {

    @Value("${synapse.base-url}")
    private String baseUrl;

    public String generateSsoRedirectUrl(String ssoToken) {
        return String.format(
                "%s/auth/v1/sso/callback?token=%s", baseUrl, URLEncoder.encode(ssoToken, StandardCharsets.UTF_8));
    }

    public String generateHomeRedirectUrl(String sessionToken, String email) {
        return String.format(
                "%s/redirect?token=%s&email=%s",
                baseUrl,
                URLEncoder.encode(sessionToken, StandardCharsets.UTF_8),
                URLEncoder.encode(email, StandardCharsets.UTF_8));
    }
}
