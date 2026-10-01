package com.dentalstack.patient.feature.blog.service;

import com.dentalstack.patient.feature.blog.dto.AddBlogRequest;
import com.dentalstack.patient.feature.blog.entity.Blog;
import jakarta.annotation.Nullable;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface BlogService {
    Blog addBlog(AddBlogRequest req, @Nullable MultipartFile blogImage);

    List<Blog> getBlogs(@Nullable Long blogId, int page, int size);
}
