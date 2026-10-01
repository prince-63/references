package com.dentalstack.patient.application.config;

import com.dentalstack.patient.application.config.doctor.ContentCachingFilter;
import com.dentalstack.patient.application.config.doctor.DoctorAuthorizationInterceptor;
import com.dentalstack.patient.feature.api_registry.interceptor.ApiUsageInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {
    private final DoctorAuthorizationInterceptor doctorAuthorizationInterceptor;
    private final ApiUsageInterceptor interceptor;
    private final ThreadPoolTaskExecutor mvcTaskExecutor;

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
        registry.addInterceptor(doctorAuthorizationInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/token/v1/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/actuator/health",
                        "/error",
                        "/patient/profile/v1/uuid/*",
                        "/patient/profile/v1/*",
                        "/patient/unassigned/v1/auth/register",
                        "/patient/chargebee/v1/create/customer/subscription",
                        "/ws-chat/**",
                        "/patient/ws-chat/**");
        registry.addInterceptor(interceptor).addPathPatterns("/**");
    }

    @Bean
    public FilterRegistrationBean<ContentCachingFilter> contentCachingFilter() {
        FilterRegistrationBean<ContentCachingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new ContentCachingFilter());
        registrationBean.addUrlPatterns("/*");

        registrationBean.setOrder(-200);
        registrationBean.setName("contentCachingFilter");

        return registrationBean;
    }

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        configurer.setTaskExecutor(mvcTaskExecutor);
        configurer.setDefaultTimeout(30_000);
    }
}
