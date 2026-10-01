package com.dentalstack.doctor.config;

import com.dentalstack.doctor.config.doctor.ContentCachingFilter;
import com.dentalstack.doctor.config.doctor.DoctorAuthorizationInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {
    private final DoctorAuthorizationInterceptor doctorAuthorizationInterceptor;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        boolean isLocal = activeProfiles.contains("local");

        registry.addInterceptor(doctorAuthorizationInterceptor)
                .addPathPatterns("/**") // Apply to all paths
                .excludePathPatterns(
                        "/auth/token/v1/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/actuator/health",
                        "/doctor/v1/doctor-details/**",
                        "/doctor/v1/organization/**",
                        "/error",
                        "/patient/profile/v1/uuid/*",
                        "/patient/profile/v1/*",
                        "/patient/unassigned/v1/auth/register",
                        "/doctor/profile/management/v1/profiles",
                        "/doctor/v1/doc-details",
                        isLocal ? "/doctor/**" : "/doctor/v1/sign/up",
                        "/patient/chargebee/v1/create/customer/subscription");
    }

    @Bean
    public FilterRegistrationBean<ContentCachingFilter> contentCachingFilter() {
        FilterRegistrationBean<ContentCachingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new ContentCachingFilter());
        registrationBean.addUrlPatterns("/*"); // Apply to all URLs

        // Set order to run before Spring Security filters
        // Spring Security typically starts around -100, so we use -200
        registrationBean.setOrder(-200);
        registrationBean.setName("contentCachingFilter");

        return registrationBean;
    }
}
