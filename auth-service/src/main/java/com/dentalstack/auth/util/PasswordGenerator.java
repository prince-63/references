package com.dentalstack.auth.util;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PasswordGenerator {
    private static final String UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL_CHARACTERS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    private static final SecureRandom random = new SecureRandom();

    public static String generateSecureToken(int length) {
        if (length < 4) {
            throw new IllegalArgumentException(
                    "Password length must be at least 4 characters to meet security requirements");
        }

        List<Character> passwordChars = new ArrayList<>();

        // Ensure at least one character from each required category
        passwordChars.add(getRandomChar(UPPERCASE_LETTERS));
        passwordChars.add(getRandomChar(LOWERCASE_LETTERS));
        passwordChars.add(getRandomChar(DIGITS));
        passwordChars.add(getRandomChar(SPECIAL_CHARACTERS));

        // Fill remaining positions with alphanumeric characters
        String alphanumeric = UPPERCASE_LETTERS + LOWERCASE_LETTERS + DIGITS;
        for (int i = 4; i < length; i++) {
            passwordChars.add(getRandomChar(alphanumeric));
        }

        // Shuffle the characters to avoid predictable patterns
        Collections.shuffle(passwordChars, random);

        // Convert to string
        StringBuilder password = new StringBuilder();
        for (Character ch : passwordChars) {
            password.append(ch);
        }

        return password.toString();
    }

    public static String generateSecureTokenMixed(int length) {
        if (length < 4) {
            throw new IllegalArgumentException(
                    "Password length must be at least 4 characters to meet security requirements");
        }

        List<Character> passwordChars = new ArrayList<>();

        passwordChars.add(getRandomChar(UPPERCASE_LETTERS));
        passwordChars.add(getRandomChar(LOWERCASE_LETTERS));
        passwordChars.add(getRandomChar(DIGITS));
        passwordChars.add(getRandomChar(SPECIAL_CHARACTERS));

        String allCharacters = UPPERCASE_LETTERS + LOWERCASE_LETTERS + DIGITS + SPECIAL_CHARACTERS;
        for (int i = 4; i < length; i++) {
            passwordChars.add(getRandomChar(allCharacters));
        }

        Collections.shuffle(passwordChars, random);

        StringBuilder password = new StringBuilder();
        for (Character ch : passwordChars) {
            password.append(ch);
        }

        return password.toString();
    }

    public static String generateCustomSecureToken(int length, boolean includeSpecialChars, String customSpecialChars) {
        if (length < 3) {
            throw new IllegalArgumentException("Password length must be at least 3 characters");
        }

        List<Character> passwordChars = new ArrayList<>();

        // Always include at least one uppercase, lowercase, and digit
        passwordChars.add(getRandomChar(UPPERCASE_LETTERS));
        passwordChars.add(getRandomChar(LOWERCASE_LETTERS));
        passwordChars.add(getRandomChar(DIGITS));

        String specialChars = customSpecialChars != null ? customSpecialChars : SPECIAL_CHARACTERS;

        // Add special character if required
        if (includeSpecialChars) {
            if (length < 4) {
                throw new IllegalArgumentException(
                        "Password length must be at least 4 characters when including special characters");
            }
            passwordChars.add(getRandomChar(specialChars));
        }

        // Fill remaining positions
        String baseChars = UPPERCASE_LETTERS + LOWERCASE_LETTERS + DIGITS;
        String allChars = includeSpecialChars ? baseChars + specialChars : baseChars;

        for (int i = passwordChars.size(); i < length; i++) {
            passwordChars.add(getRandomChar(allChars));
        }

        // Shuffle the characters
        Collections.shuffle(passwordChars, random);

        // Convert to string
        StringBuilder password = new StringBuilder();
        for (Character ch : passwordChars) {
            password.append(ch);
        }

        return password.toString();
    }

    /**
     * Helper method to get a random character from a string
     */
    private static char getRandomChar(String source) {
        return source.charAt(random.nextInt(source.length()));
    }

    /**
     * Validates if a password meets the security requirements
     */
    public static boolean isSecurePassword(String password) {
        if (password == null || password.length() < 4) {
            return false;
        }

        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> SPECIAL_CHARACTERS.indexOf(ch) >= 0);

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
