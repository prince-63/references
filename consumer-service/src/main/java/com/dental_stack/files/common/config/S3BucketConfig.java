package com.dental_stack.files.common.config;

import com.dental_stack.application.DatabaseType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.aws.s3.buckets")
@Getter
@Setter
public class S3BucketConfig {
    private String dev;
    private String stage;
    private String prod;

    public String resolve(DatabaseType type) {
        return switch (type) {
            case DEV -> dev;
            case STAGE -> stage;
            case PROD -> prod;
        };
    }
}
