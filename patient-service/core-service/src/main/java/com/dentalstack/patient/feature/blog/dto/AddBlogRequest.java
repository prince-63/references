package com.dentalstack.patient.feature.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddBlogRequest {
    private String name;
    private String url;
    private String content;
    private String duration;
    private String category;
}
