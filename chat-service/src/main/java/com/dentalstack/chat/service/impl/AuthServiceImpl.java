package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.client.AuthServiceClient;
import com.dentalstack.chat.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthServiceClient authServiceClient;

    @Override
    public boolean loginAuthTypeCheck(String email) {
        return authServiceClient.loginAuthTypeCheck(email);
    }
}
