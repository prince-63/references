package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.firebase.FirebaseRequest;

public interface FirebaseService {

    String addToken(FirebaseRequest firebaseRequest);

    String getToken(String email);
}
