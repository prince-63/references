package com.dentalstack.auth.service.apple;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.dentalstack.auth.exception.apple.AppleTokenExpiredException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AppleTokenVerifier {

    @Autowired
    private AppleKeyProvider appleKeyProvider;

    @Autowired
    private UserDataDeserializer userDataDeserializer;

    public AppleIdToken verify(String idToken) throws JWTVerificationException {
        // Supabase uses HS256 algorithm, so adjust accordingly
        Algorithm validationAlg =
                Algorithm.HMAC256(
                        "8hsOt/X/tJ72Lj6DYhXMq9+sVYNfcai5B7MpYXxoyIsH01MS5pPql20Pu7IjpMK5rq6v/Wa+AznAOI5oEqkvgQ=="); // Replace "your-secret-key" with the actual secret used by Supabase
        var jwtVerifier = JWT.require(validationAlg).build();

        UserData userData = null;
        try {
            DecodedJWT decodedJWT = jwtVerifier.verify(idToken);
            userData = userDataDeserializer.getUserDataFromIdToken(idToken);
        } catch (TokenExpiredException e) {
            userData = userDataDeserializer.getUserDataFromIdToken(idToken);
            throw new AppleTokenExpiredException(new AppleIdToken(idToken, userData));
        }

        return new AppleIdToken(idToken, userData);
    }
}
