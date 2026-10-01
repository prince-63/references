package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.dto.firebase.FirebaseRequest;
import com.dentalstack.auth.entity.Firebase;
import com.dentalstack.auth.repository.FirebaseRepository;
import com.dentalstack.auth.service.FirebaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FirebaseServiceImpl implements FirebaseService {
    private final FirebaseRepository firebaseRepository;

    @Override
    public String addToken(FirebaseRequest firebaseRequest) {
        if (firebaseRequest.getEmail() == null || firebaseRequest.getToken() == null) {
            throw new IllegalArgumentException("Email and token cannot be null");
        }

        Firebase firebase = firebaseRepository.findByEmail(firebaseRequest.getEmail());
        if (firebase != null) {
            firebase.setToken(firebaseRequest.getToken());
            firebaseRepository.save(firebase);
            return "Token updated successfully";
        } else {
            firebaseRepository.save(Firebase.builder()
                    .email(firebaseRequest.getEmail())
                    .token(firebaseRequest.getToken())
                    .build());
        }
        return firebaseRequest.getToken();
    }

    @Override
    public String getToken(String email) {
        Firebase firebase = firebaseRepository.findByEmail(email);
        if (firebase != null) {
            return firebase.getToken();
        } else {
            return null;
        }
    }
}
