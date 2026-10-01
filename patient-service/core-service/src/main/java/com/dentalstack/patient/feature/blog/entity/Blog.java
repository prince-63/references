package com.dentalstack.patient.feature.blog.entity;

import com.dentalstack.patient.feature.blog.dto.AddBlogRequest;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "blog")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Blog extends BaseEntity {
    private String name;
    private String url;
    private String content;
    private String imageUrl;
    private String imageName;
    private boolean active;
    private String duration;
    private String category;

    public static Blog from(AddBlogRequest req, String imageUrl) {
        return Blog.builder()
                .name(req.getName())
                .url(req.getUrl())
                .content(req.getContent())
                .imageUrl(imageUrl)
                .active(true)
                .duration(req.getDuration())
                .category(req.getCategory())
                .build();
    }
}
