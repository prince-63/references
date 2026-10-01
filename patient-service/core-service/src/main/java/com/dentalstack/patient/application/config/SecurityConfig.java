package com.dentalstack.patient.application.config;

import com.dentalstack.patient.application.config.exception.CustomAccessDeniedHandler;
import com.dentalstack.patient.application.config.exception.CustomAuthenticationEntryPoint;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthFilter;
    private final OrganizationAuthFilter organizationAuthFilter;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth.requestMatchers(
                                "/patient/services/info",
                                "/patient/profile/v2/get/profile_picture/**",
                                "/patient/custom/appointment/**",
                                "/patient/**",
                                "/swagger-resources/**",
                                "/swagger-ui.html/**",
                                "/mail/**",
                                "/notification/v1/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/patient/subscription/v1/**",
                                "/patient/lead/v1/overview/**",
                                "/patient/new/invitation/v1/doctor/**",
                                "/patient/profile/v1/uuid/**",
                                "/patient/chargebee/v1/create/customer/subscription/**",
                                "/patient/profile/v1/**",
                                "/actuator/**",
                                "/actuator/health",
                                "/patient",
                                "/patient/unassigned/**",
                                "/patient/app/v1/**",
                                "/patient/v2/patient-connection-details/**",
                                "/patient/chargebee/v1/event",
                                "/patient/timeline/v1/**",
                                "/patient/cache/**",
                                "/patient/timeline/v1/without/**",
                                "/patient/subscription/v1/details/**",
                                "/patient/cache/v1/**",
                                "patient/shipping/**",
                                "/patient/subscription/v1/deactivate-subscription/**",
                                "patient/card-display-config/**",
                                "/patient/drive/**",
                                "/patient/profile/v2/get/**",
                                "/patient/doctor/v1/super-admin/**",
                                "/ws-chat/**",
                                "/patient/ws-chat/**",
                                "/error")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .headers(headers -> headers.xssProtection(
                                xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true)
                                .maxAgeInSeconds(31536000)
                                .preload(false))
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .accessDeniedHandler(customAccessDeniedHandler)
                        .authenticationEntryPoint(customAuthenticationEntryPoint))
                .addFilterBefore(organizationAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthFilter, OrganizationAuthFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "https://*.dental-stack.com",
                "https://web.smilezy.com",
                "https://web.craftalign.com",
                "https://web.routetosmile.com",
                "https://confialign.confidentlab.com",
                "https://web.synapsehealthtech.in",
                "https://doctors.clearcastle.in",
                "https://web.dental-stack.com",
                "https://doctors.smilexcel.com",
                "https://doctors.aiiqaligner.com",
                "https://smilexcel.stage.dental-stack.com",
                "https://patient.stage.dental-stack.com",
                "https://cases.routetosmile.com",
                "http://localhost:*"));

        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:8000"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
