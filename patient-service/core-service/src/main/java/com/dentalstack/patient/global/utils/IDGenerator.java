package com.dentalstack.patient.global.utils;

import java.security.SecureRandom;
import java.util.Base64;

public class IDGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static String generateDriveStyleId() {
        byte[] randomBytes = new byte[24];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
