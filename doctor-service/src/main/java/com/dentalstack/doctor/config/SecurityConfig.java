package com.dentalstack.doctor.config;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // First, define the public endpoints that should be accessible without authentication
                .authorizeHttpRequests(auth -> auth.requestMatchers(
                                "/patient/profile/v1/register",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/doctor/**",
                                "/doctor/v1/sign/up",
                                "/auth/doctor/v1/**",
                                "/actuator/health",
                                "/doctor/rbac/v1/**",
                                "/doctor/practice/location/v1/**",
                                "/doctor/v1/organization/**",
                                "/doctor/v1/email",
                                "/mail/invite-practice",
                                "/doctor/profile/management/v1/profiles",
                                "/doctor/v1/doc-details",
                                "/doctor/invitation/v1/**")
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
                .addFilterBefore(organizationAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthFilter, OrganizationAuthFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
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
                "https://clearcastle.stage.dental-stack.com",
                "https://web.dental-stack.com",
                "https://doctors.smilexcel.com",
                "https://smilexcel.stage.dental-stack.com",
                "https://cases.routetosmile.com",
                "https://doctors.aiiqaligner.com"));

        config.setAllowedOrigins(List.of("http://localhost:3000"));

        config.setAllowedMethods(List.of("*"));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
