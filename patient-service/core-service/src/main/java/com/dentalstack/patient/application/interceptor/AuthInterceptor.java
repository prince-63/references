package com.dentalstack.patient.application.interceptor;

import com.dentalstack.patient.feature.auth.client.AuthServiceClient;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthServiceClient authServiceClient;

    @Autowired
    public AuthInterceptor(@Lazy AuthServiceClient authServiceClient) {
        this.authServiceClient = authServiceClient;
    }

    public static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    public static final String USER_ID_HEADER_NAME = "User-Id";

    public static final String USER_TYPE_HEADER_NAME = "User-Type";

    @Override
    public boolean preHandle(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler)
            throws IOException {

        return true;
    }
}
