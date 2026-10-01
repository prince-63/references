package com.dentalstack.auth.service;

import com.dentalstack.auth.exception.google.GoogleTokenExpiredException;
import com.dentalstack.auth.exception.google.GoogleTokenVerificationFailedException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class GoogleTokenVerifier extends GoogleIdTokenVerifier {
    public GoogleTokenVerifier(List<String> issuers, List<String> audience) {
        super(new Builder(new NetHttpTransport(), new GsonFactory())
                .setIssuers(issuers)
                .setAudience(audience));
    }

    @Override
    public GoogleIdToken verify(String idTokenString)
            throws IOException, GoogleTokenExpiredException, GoogleTokenVerificationFailedException {
        GoogleIdToken idToken = GoogleIdToken.parse(getJsonFactory(), idTokenString);

        if (getIssuers() != null && !idToken.verifyIssuer(getIssuers())) {
            throw new GoogleTokenVerificationFailedException(idToken, "Invalid issuers");
        }

        if (getAudience() != null && !idToken.verifyAudience(getAudience())) {
            throw new GoogleTokenVerificationFailedException(idToken, "Invalid audience");
        }

        var currentTime = System.currentTimeMillis();
        if (!idToken.verifyIssuedAtTime(currentTime, getAcceptableTimeSkewSeconds())) {
            throw new GoogleTokenVerificationFailedException(idToken, "invalid token issue time");
        }

        if (!idToken.verifyExpirationTime(currentTime, getAcceptableTimeSkewSeconds())) {
            throw new GoogleTokenExpiredException(idToken);
        }

        return idToken;
    }
}
