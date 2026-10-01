package com.dentalstack.auth.entity;

public interface Token {
    boolean isTokenValid();

    boolean hasTokenExpired();
}
