package com.dentalstack.patient.feature.blog.service;

import com.dentalstack.patient.feature.blog.dto.AddBlogRequest;
import com.dentalstack.patient.feature.blog.dto.BlogProperties;
import com.dentalstack.patient.feature.blog.entity.Blog;
import com.dentalstack.patient.feature.blog.exception.BlogNotFoundException;
import com.dentalstack.patient.feature.blog.repository.BlogRepository;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import jakarta.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final AmazonS3Service amazonS3Service;

    @Autowired
    private BlogProperties blogProperties;

    @Value("${app.cloud.amazon.s3.bucket.blog}")
    private String blogBucket;

    @Override
    @Transactional
    public Blog addBlog(AddBlogRequest req, @Nullable MultipartFile blogImage) {
        String imageUrl = null;
        if (blogImage != null) {
            try {
                imageUrl = amazonS3Service.storeFile(blogBucket, "blog/" + blogImage.getOriginalFilename(), blogImage);
            } catch (Exception e) {
            }
        }

        return blogRepository.save(Blog.from(req, imageUrl));
    }

    @Override
    public List<Blog> getBlogs(@Nullable Long blogId, int page, int size) {
        List<Blog> blogs;

        if (blogId != null) {
            Blog singleBlog = blogRepository.findById(blogId).orElseThrow(() -> new BlogNotFoundException(blogId));
            blogs = List.of(singleBlog);
        } else {
            blogs = new ArrayList<>(
                    blogRepository.findAll(PageRequest.of(page, size)).getContent());

            if (blogs.isEmpty()) {
                for (BlogProperties.BlogDefaults defaults : blogProperties.getDefaults()) {
                    blogs.add(addBlog(
                            createNewBlogRequest(
                                    defaults.getName(),
                                    defaults.getUrl(),
                                    defaults.getDuration(),
                                    defaults.getCategory()),
                            defaults.getImageUrl()));
                }
            }
        }
        return blogs;
    }

    private AddBlogRequest createNewBlogRequest(String name, String url, String duration, String category) {
        return AddBlogRequest.builder()
                .name(name)
                .url(url)
                .duration(duration)
                .category(category)
                .build();
    }

    public Blog addBlog(AddBlogRequest req, @Nullable String imageUrl) {
        var blog = blogRepository.save(Blog.from(req, imageUrl));
        log.info("New blog {} added with id {}.", blog.getName(), blog.getId());
        return blog;
    }
}
