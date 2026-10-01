package com.dentalstack.patient.application.config;

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

    // todo define which api endpoints are public and which are protected
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // First, define the public endpoints that should be accessible without authentication
                .authorizeHttpRequests(auth -> auth.requestMatchers(
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
                                "/actuator/health",
                                "/patient/location/v1/**",
                                "/patient/unassigned/**",
                                "/patient/app/v1/**",
                                "/patient/v2/patient-connection-details/**",
                                "/patient/chargebee/v1/event",
                                "/patient/timeline/v1/**")
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
                // Add the JWT filter only AFTER the security rules are defined
                .addFilterAfter(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("https://*.dental-stack.com");
        config.addAllowedOriginPattern("https://web.smilezy.com");
        config.addAllowedOriginPattern("https://web.craftalign.com");
        config.addAllowedOriginPattern("https://web.routetosmile.com");
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:8000");
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("https://patient.stage.dental-stack.com");
        config.addAllowedOriginPattern("https://doctors.clearcastle.in");
        config.addAllowedOriginPattern("https://clearcastle.stage.dental-stack.com");
        config.addAllowedOriginPattern("https://web.dental-stack.com");
        config.addAllowedOriginPattern("https://smilexcel.stage.dental-stack.com");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true); // Allow cookies/auth headers

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
