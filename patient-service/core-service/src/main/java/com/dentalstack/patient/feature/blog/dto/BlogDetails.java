package com.dentalstack.patient.feature.blog.dto;

import com.dentalstack.patient.feature.blog.entity.Blog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogDetails {
    private Long id;
    private String name;
    private String url;
    private String imageUrl;
    private String content;
    private String duration;
    private String category;

    public static BlogDetails from(Blog blog) {
        return BlogDetails.builder()
                .id(blog.getId())
                .name(blog.getName())
                .url(blog.getUrl())
                .imageUrl(blog.getImageUrl())
                .content(blog.getContent())
                .duration(blog.getDuration())
                .category(blog.getCategory())
                .build();
    }
}
