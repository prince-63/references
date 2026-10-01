package com.dentalstack.patient.global.utils;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;

public record ByteArrayMultipartFile(String name, String originalFilename, String contentType, byte[] content)
        implements MultipartFile {

    public static ByteArrayMultipartFile create(String filename, String contentType, byte[] content) {
        return new ByteArrayMultipartFile(filename, filename, contentType, content);
    }

    public static ByteArrayMultipartFile create(
            String name, String originalFilename, String contentType, byte[] content) {
        return new ByteArrayMultipartFile(name, originalFilename, contentType, content);
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return content == null || content.length == 0;
    }

    @Override
    public long getSize() {
        return content == null ? 0 : content.length;
    }

    @Override
    public byte[] getBytes() {
        return content;
    }

    @Override
    public InputStream getInputStream() {
        return new ByteArrayInputStream(content);
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        throw new UnsupportedOperationException("transferTo operation is not supported for ByteArrayMultipartFile. "
                + "Use Files.write(path, getBytes()) to write content to file system.");
    }
}
