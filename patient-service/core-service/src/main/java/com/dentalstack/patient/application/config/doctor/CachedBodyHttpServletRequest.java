package com.dentalstack.patient.application.config.doctor;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {

    private static final Logger logger = LoggerFactory.getLogger(CachedBodyHttpServletRequest.class);
    private final byte[] cachedBody;
    private final boolean isMultipart;

    public CachedBodyHttpServletRequest(HttpServletRequest request) throws IOException {
        super(request);
        this.isMultipart = isMultipartRequest(request);

        if (isMultipart) {
            logger.debug("Multipart request detected, not caching body");
            this.cachedBody = new byte[0];
        } else {
            this.cachedBody = readRequestBody(request);
            logger.debug("Cached request body, length: {}", cachedBody.length);
        }
    }

    private boolean isMultipartRequest(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null
                && (contentType.toLowerCase().startsWith("multipart/form-data")
                        || contentType.toLowerCase().startsWith("multipart/mixed"));
    }

    private byte[] readRequestBody(HttpServletRequest request) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        try (BufferedReader bufferedReader = request.getReader()) {
            char[] charBuffer = new char[128];
            int bytesRead;
            while ((bytesRead = bufferedReader.read(charBuffer)) > 0) {
                stringBuilder.append(charBuffer, 0, bytesRead);
            }
        }
        String body = stringBuilder.toString();
        return body.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        if (isMultipart) {

            return super.getInputStream();
        }
        return new CachedBodyServletInputStream(this.cachedBody);
    }

    @Override
    public BufferedReader getReader() throws IOException {
        if (isMultipart) {

            return super.getReader();
        }
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(this.cachedBody);
        return new BufferedReader(new InputStreamReader(byteArrayInputStream, StandardCharsets.UTF_8));
    }

    public byte[] getCachedBody() {
        if (isMultipart) {
            logger.warn("Attempting to get cached body for multipart request - returning empty array");
            return new byte[0];
        }
        return cachedBody.clone();
    }

    public String getCachedBodyAsString() {
        if (isMultipart) {
            logger.warn("Attempting to get cached body string for multipart request - returning empty string");
            return "";
        }
        return new String(cachedBody, StandardCharsets.UTF_8);
    }

    public boolean isMultipartRequest() {
        return isMultipart;
    }

    private static class CachedBodyServletInputStream extends ServletInputStream {
        private final ByteArrayInputStream byteArrayInputStream;

        public CachedBodyServletInputStream(byte[] cachedBody) {
            this.byteArrayInputStream = new ByteArrayInputStream(cachedBody);
        }

        @Override
        public boolean isFinished() {
            return byteArrayInputStream.available() == 0;
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setReadListener(ReadListener listener) {
            throw new RuntimeException("Not implemented");
        }

        @Override
        public int read() throws IOException {
            return byteArrayInputStream.read();
        }
    }
}
