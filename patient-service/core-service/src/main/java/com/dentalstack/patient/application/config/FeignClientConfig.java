package com.dentalstack.patient.application.config;

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
    private static final String PROFILE_ID_HEADER = "profile_id";
    private static final String ORGANIZATION_ID_HEADER = "organization_id";
    private static final String PROFILE_ID_HEADER_ALT = "Profile-id";
    private static final String PROFILE_ID_HEADER_ALT2 = "profile-id";
    private static final String ORGANIZATION_ID_HEADER_ALT = "Organization-id";
    private static final String ORGANIZATION_ID_HEADER_ALT2 = "organization-id";

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                String token = attributes.getRequest().getHeader(AUTHORIZATION_HEADER);
                if (token != null) {
                    requestTemplate.header(AUTHORIZATION_HEADER, token);
                }

                String orgName = attributes.getRequest().getHeader(ORG_NAME_HEADER);
                if (orgName != null) {
                    requestTemplate.header(ORG_NAME_HEADER, orgName);
                }

                String orgToken = attributes.getRequest().getHeader(ORG_TOKEN_HEADER);
                if (orgToken != null) {
                    requestTemplate.header(ORG_TOKEN_HEADER, orgToken);
                }

                String userType = attributes.getRequest().getHeader(USER_TYPE_HEADER);
                if (userType != null) {
                    requestTemplate.header(USER_TYPE_HEADER, userType);
                }

                String userId = attributes.getRequest().getHeader(USER_ID_HEADER);
                if (userId != null) {
                    requestTemplate.header(USER_ID_HEADER, userId);
                }

                String profileId = getHeaderWithVariations(
                        attributes, PROFILE_ID_HEADER, PROFILE_ID_HEADER_ALT, PROFILE_ID_HEADER_ALT2);
                if (profileId != null) {
                    requestTemplate.header(PROFILE_ID_HEADER, profileId);
                }

                String organizationId = getHeaderWithVariations(
                        attributes, ORGANIZATION_ID_HEADER, ORGANIZATION_ID_HEADER_ALT, ORGANIZATION_ID_HEADER_ALT2);
                if (organizationId != null) {
                    requestTemplate.header(ORGANIZATION_ID_HEADER, organizationId);
                }
            }
        };
    }

    private String getHeaderWithVariations(ServletRequestAttributes attributes, String... headerNames) {
        for (String headerName : headerNames) {
            String value = attributes.getRequest().getHeader(headerName);
            if (value != null && !value.trim().isEmpty()) {
                return value;
            }
        }
        return null;
    }
}
