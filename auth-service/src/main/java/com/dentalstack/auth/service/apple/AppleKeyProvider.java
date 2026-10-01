package com.dentalstack.auth.service.apple;

import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.interfaces.RSAKeyProvider;
import com.dentalstack.auth.client.GoogleFirebaseJwksClient;
import java.io.ByteArrayInputStream;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AppleKeyProvider implements RSAKeyProvider {
    private static String DEFAULT_APPLE_KEY_URL =
            "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
    private static int CACHE_EXPIRE_HOURS = 24;
    private static int CACHE_SIZE = 10;

    private static int BUCKET_SIZE = 10;
    private static int BUCKET_REFILL_RATE_PER_MINUTE = 1;

    @Autowired
    private GoogleFirebaseJwksClient googleFirebaseJwksClient;

    private static final JwkProvider provider = new JwkProviderBuilder(DEFAULT_APPLE_KEY_URL)
            .cached(CACHE_SIZE, CACHE_EXPIRE_HOURS, TimeUnit.HOURS)
            .rateLimited(BUCKET_SIZE, BUCKET_REFILL_RATE_PER_MINUTE, TimeUnit.MINUTES)
            .build();

    @Value("${dentalstack.apple.key-provider.url}")
    public void setDefaultAppleKeyUrl(String url) {
        DEFAULT_APPLE_KEY_URL = url;
    }

    public String getDefaultAppleKeyUrl() {
        return DEFAULT_APPLE_KEY_URL;
    }

    @Value("${dentalstack.apple.key-provider.cache.size}")
    public void setCacheSize(int size) {
        CACHE_SIZE = size;
    }

    public int getCacheSize() {
        return CACHE_SIZE;
    }

    @Value("${dentalstack.apple.key-provider.bucket.size}")
    public void setBucketSize(int size) {
        BUCKET_SIZE = size;
    }

    public int getBucketSize() {
        return BUCKET_SIZE;
    }

    @Value("${dentalstack.apple.key-provider.bucket.refill-rate-per-min}")
    public void setBucketRefillRatePerMinute(int refillRatePerMinute) {
        BUCKET_REFILL_RATE_PER_MINUTE = refillRatePerMinute;
    }

    public int getBucketRefillRatePerMinute() {
        return BUCKET_REFILL_RATE_PER_MINUTE;
    }

    @Value("${dentalstack.apple.key-provider.cache.expire-in-hours}")
    public void setCacheExpireHours(int hours) {
        CACHE_EXPIRE_HOURS = hours;
    }

    public int getCacheExpireHours() {
        return CACHE_EXPIRE_HOURS;
    }

    @Override
    public RSAPublicKey getPublicKeyById(String keyId) {
        var keyStr = googleFirebaseJwksClient.getPublicKey().get(keyId);
        var certificateString = keyStr.replace("-----BEGIN CERTIFICATE-----", "")
                .replace("-----END CERTIFICATE-----", "")
                .replaceAll("\\s", "");
        byte[] certificateData = java.util.Base64.getDecoder().decode(certificateString);

        // Create a ByteArrayInputStream to read the certificate data
        ByteArrayInputStream bis = new ByteArrayInputStream(certificateData);

        // Create a CertificateFactory
        CertificateFactory cf = null;
        try {
            cf = CertificateFactory.getInstance("X.509");
            X509Certificate cert = (X509Certificate) cf.generateCertificate(bis);
            PublicKey publicKey = cert.getPublicKey();
            return (RSAPublicKey) publicKey;
        } catch (CertificateException e) {
            return null;
        }
    }

    @Override
    public RSAPrivateKey getPrivateKey() {
        throw new UnsupportedOperationException("Can't get apple private key.");
    }

    @Override
    public String getPrivateKeyId() {
        throw new UnsupportedOperationException("Can't get apple private key.");
    }
}
