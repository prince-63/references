package com.dentalstack.patient.feature.blog.dto;

import com.dentalstack.patient.feature.blog.entity.Blog;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Blogs {
    private List<BlogDetails> blogs;

    public static Blogs from(List<Blog> blogs) {
        return new Blogs(blogs.stream().map(BlogDetails::from).toList());
    }
}
