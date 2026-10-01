package com.dentalstack.auth.config;

import com.dentalstack.auth.config.filter.OrganizationAuthFilter;
import com.dentalstack.auth.service.security.CustomUserDetailsService;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    private final CustomUserDetailsService userDetailsService;
    private final OrganizationAuthFilter organizationAuthFilter;

    // List of public endpoints
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/auth/v1/login/password",
            "/auth/v1/signup/password/start",
            "/auth/v1/signup/google/start",
            "/auth/v1/logout-device",
            "/auth/firebase/v1/token",
            "/auth/v1/email/otp/validate",
            "/auth/v1/password/reset",
            "/auth/v1/email/otp",
            "/auth/v1/device/**",
            "/auth/doctor/v1/**",
            "/doctor/v1/**",
            "/auth/doctor/v1/**",
            "/auth/patient/v1/**",
            "/auth/token/v1/validate",
            "/error",
            "/auth/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/actuator/health",
            "/auth/token/v1/token/refresh",
            "/patient/profile/v1/uuid/**",
            "/auth/doctor/v2/update/details/**",
            "/auth/doctor/v2/signup/url/**",
            "/auth/v1/admin/organization/**",
            "/auth/v1/sso/signup",
            "/auth/v1/fetch-login-type",
            "/auth/v1/sso/sync/users",
            // New SSO endpoints
            "/auth/v1/sso/callback",
            "/auth/v1/sso/refresh",
            "/auth/v1/sso/login/**",
            "/auth/v1/webhook/**",
            "/auth/v1/admin/get-password",
            "/auth/v2/fetch-login-type",
            "/auth/v1/admin/unblock",
            "/auth/v1/validate/password",
            "/auth/v2/validate/password");

    @Bean
    public UserDetailsService userDetailsService() {
        return userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth.requestMatchers(PUBLIC_ENDPOINTS.toArray(new String[0]))
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
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
        provider.setUserDetailsService(userDetailsService);

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
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
                "https://web.dental-stack.com",
                "https://smilexcel.stage.dental-stack.com",
                "https://doctors.smilexcel.com",
                "https://doctors.clearcastle.in",
                "https://clearcastle.stage.dental-stack.com",
                "https://doctors.aiiqaligner.com",
                "https://cases.routetosmile.com",
                "http://localhost:3000"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        config.setExposedHeaders(List.of("Authorization", "Content-Type"));

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
