package com.dentalstack.patient.feature.blog.controller;

import com.dentalstack.patient.feature.blog.dto.AddBlogRequest;
import com.dentalstack.patient.feature.blog.dto.BlogDetails;
import com.dentalstack.patient.feature.blog.dto.Blogs;
import com.dentalstack.patient.feature.blog.exception.FailedToParseBlogDetails;
import com.dentalstack.patient.feature.blog.service.BlogService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "blog", description = "Blog APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/blog/v1")
@Slf4j
public class BlogController {

    private final BlogService blogService;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Add new blog.")
    public ResponseEntity<BlogDetails> addBlog(
            @Parameter(
                            name = "details",
                            example =
                                    """
         {
          "name": "Sample blog",
          "url": "https://blogs/content/url",
          "content": "Sample content",
          "duration": "2 mins"
        }
        """)
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(required = false) MultipartFile blogImage) {
        AddBlogRequest request = new AddBlogRequest();
        try {
            request = mapper.readValue(reqStr, AddBlogRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse blogs details, {}", reqStr);
            throw new FailedToParseBlogDetails(reqStr, e);
        }

        return ResponseEntity.ok(BlogDetails.from(blogService.addBlog(request, blogImage)));
    }

    @GetMapping
    @Operation(summary = "Get blogs")
    public ResponseEntity<Blogs> getBlogs(
            @RequestParam(value = "blog_id", required = false) Long blogId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size) {
        return ResponseEntity.ok(Blogs.from(blogService.getBlogs(blogId, page, size)));
    }
}
