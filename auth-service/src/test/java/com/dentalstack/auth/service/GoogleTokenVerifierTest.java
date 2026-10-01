package com.dentalstack.auth.service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class GoogleTokenVerifierTest {

    private final GoogleTokenVerifier googleTokenVerifier;

    public GoogleTokenVerifierTest() {
        googleTokenVerifier = new GoogleTokenVerifier(
                List.of(
                        "https://securetoken.google.com/dentalstack-b31ed",
                        "https://accounts.google.com",
                        "accounts.google.com"),
                Collections.singletonList("863007169922-5ffkangcr000almrh9uec8tgr93a2s1h.apps.googleusercontent.com"));
    }

    @Test
    public void testVerify() throws IOException {
        var token =
                "eyJhbGciOiJSUzI1NiIsImtpZCI6IjA4YmY1YzM3NzJkZDRlN2E3MjdhMTAxYmY1MjBmNjU3NWNhYzMyNmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NjMwMDcxNjk5MjItaTc2NWN0NDFmaDA1am9tYnY3bzRsYWJyam8xczg2c2IuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NjMwMDcxNjk5MjItNWZma2FuZ2NyMDAwYWxtcmg5dWVjOHRncjkzYTJzMWguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg1NjgzMzY2ODE3NjkxMTg0NzciLCJoZCI6ImRlbnRhbC1zdGFjay5jb20iLCJlbWFpbCI6InByYXNoYW50Lm1hbGlAZGVudGFsLXN0YWNrLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiUHJhc2hhbnQgTWFsaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLU3JxSThJQnhsQWNnUXNYNEt0UFVaNDREV2NLdVh3a3MzdS1GWWZlbDE9czk2LWMiLCJnaXZlbl9uYW1lIjoiUHJhc2hhbnQiLCJmYW1pbHlfbmFtZSI6Ik1hbGkiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTcwOTk4NTEyMywiZXhwIjoxNzA5OTg4NzIzfQ.JDf4Aa_pH9PS0-bHMLsatlupnTcXK3BM8IBXVny9hjVGHqUopfY6HouYwtoAPRuvocAjA1T6uFLmZkMAmXerdZIfKQzxiEqREEsAWQMjGwkWiykDG9QiURVAgAg8Na4qo5-3T6b0qcPBHM9vqn9KvKtZY21kB3U09oK6VeyZ-_DdgSk491l3zeg56BTDfElLGpslAjhoXJaV4lmd0F04jzmV3uTPMcSzUdyOkDwMZj-8ZG5NunD4ajizJTZ5CN74i8iaFJXp1ux6Ct9B_zsOAJwV2eoDuckznuJYrkSgB3EbsAV6vUYhHR_2rx9g_a-nL_7dUQPe85kX_E3nc2E3tQ";
        Assertions.assertDoesNotThrow(() -> {
            googleTokenVerifier.verify(token);
        });
    }
}
