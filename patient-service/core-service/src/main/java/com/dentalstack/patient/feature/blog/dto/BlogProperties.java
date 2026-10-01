package com.dentalstack.patient.feature.blog.dto;

import java.util.List;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.blog")
@Data
public class BlogProperties {
    private List<BlogDefaults> defaults;

    @Data
    public static class BlogDefaults {
        private String name;
        private String url;
        private String imageUrl;
        private String duration;
        private String category;
    }
}
