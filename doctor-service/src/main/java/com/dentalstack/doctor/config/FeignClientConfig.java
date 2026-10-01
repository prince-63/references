package com.dentalstack.doctor.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    private static final String ORG_NAME_HEADER = "X-Organization-Name";
    private static final String ORG_TOKEN_HEADER = "X-Organization-Token";
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String USER_TYPE_HEADER = "User-Type";
    private static final String USER_ID_HEADER = "User-Id";
    private static final String PROFILE_ID_HEADER = "Profile-id";
    private static final String ORGANIZATION_ID_HEADER = "Organization-id";

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
            }
        };
    }
}
