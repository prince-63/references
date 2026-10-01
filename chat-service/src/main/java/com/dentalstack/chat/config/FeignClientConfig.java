package com.dentalstack.chat.config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.Retryer;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Configuration
public class FeignClientConfig {

    private static final String ORG_NAME_HEADER = "X-Organization-Name";
    private static final String ORG_TOKEN_HEADER = "X-Organization-Token";
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String USER_TYPE_HEADER = "User-Type";
    private static final String USER_ID_HEADER = "User-Id";
    private static final String PROFILE_ID_HEADER = "Profile-id";
    private static final String ORGANIZATION_ID_HEADER = "Organization-id";

    @Value(
            "${feign.service-token:Bearer eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoic2VydmljZSJ9.O-WE2HP5h5zbtDnRu9yvDRh9p0tp958Zv5gzauVeDE0}")
    private String serviceToken;

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }

    @Bean
    public Retryer feignRetryer() {
        return new Retryer.Default(100, TimeUnit.SECONDS.toMillis(1), 3);
    }

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                // Forward Authorization header
                String token = attributes.getRequest().getHeader(AUTHORIZATION_HEADER);
                if (token != null) {
                    requestTemplate.header(AUTHORIZATION_HEADER, token);
                }

                // Forward Organization Name header
                String orgName = attributes.getRequest().getHeader(ORG_NAME_HEADER);
                if (orgName != null) {
                    requestTemplate.header(ORG_NAME_HEADER, orgName);
                }

                // Forward Organization Token header
                String orgToken = attributes.getRequest().getHeader(ORG_TOKEN_HEADER);
                if (orgToken != null) {
                    requestTemplate.header(ORG_TOKEN_HEADER, orgToken);
                }

                // Forward User Type header
                String userType = attributes.getRequest().getHeader(USER_TYPE_HEADER);
                if (userType != null) {
                    requestTemplate.header(USER_TYPE_HEADER, userType);
                }

                // Forward User ID header
                String userId = attributes.getRequest().getHeader(USER_ID_HEADER);
                if (userId != null) {
                    requestTemplate.header(USER_ID_HEADER, userId);
                }

                // Forward Profile ID header
                String profileId = attributes.getRequest().getHeader(PROFILE_ID_HEADER);
                if (profileId != null) {
                    requestTemplate.header(PROFILE_ID_HEADER, profileId);
                }

                // Forward Organization ID header
                String organizationId = attributes.getRequest().getHeader(ORGANIZATION_ID_HEADER);
                if (organizationId != null) {
                    requestTemplate.header(ORGANIZATION_ID_HEADER, organizationId);
                }
            } else {
                // No HTTP request context (e.g., scheduled tasks, async consumers).
                // Use the service-to-service token so Feign calls are authenticated.
                log.debug("No request context available — using service-to-service token for Feign call");
                requestTemplate.header(AUTHORIZATION_HEADER, serviceToken);
            }
        };
    }
}
