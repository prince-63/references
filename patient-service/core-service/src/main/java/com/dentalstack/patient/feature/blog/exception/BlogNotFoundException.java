package com.dentalstack.patient.feature.blog.exception;

public class BlogNotFoundException extends RuntimeException {
    public BlogNotFoundException(Long blogId) {
        super(String.format("Blog not found with id %d", blogId));
    }
}
