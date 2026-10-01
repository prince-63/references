package com.dentalstack.patient.application.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes(
                                "bearer-jwt",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .in(SecurityScheme.In.HEADER)
                                        .name("Authorization")
                                        .description("JWT token obtained after successful authentication"))
                        .addSecuritySchemes(
                                "basic",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("basic"))
                        .addSecuritySchemes(
                                "org-name",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-Organization-Name")
                                        .description("Organization name provided by DentalStack"))
                        .addSecuritySchemes(
                                "org-token",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-Organization-Token")
                                        .description("Organization token provided by DentalStack"))
                        .addSecuritySchemes(
                                "User-Type",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("user-type")
                                        .description("Type of user (e.g., DOCTOR, PATIENT, ADMIN)"))
                        .addSecuritySchemes(
                                "User-Id",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("User-Id")
                                        .description("Unique identifier for the user"))
                        .addSecuritySchemes(
                                "Profile-id",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("Profile-id")
                                        .description("Profile identifier for the user"))
                        .addSecuritySchemes(
                                "Organization-id",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("Organization-id")
                                        .description("Organization identifier")))
                .info(new Info()
                        .title("DentalStack Patient API")
                        .version("1.0")
                        .description("API Documentation for DentalStack Patient Service"))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt", Arrays.asList("read", "write")))
                .addSecurityItem(new SecurityRequirement().addList("org-name"))
                .addSecurityItem(new SecurityRequirement().addList("org-token"))
                .addSecurityItem(new SecurityRequirement().addList("User-Type"))
                .addSecurityItem(new SecurityRequirement().addList("User-Id"))
                .addSecurityItem(new SecurityRequirement().addList("Profile-id"))
                .addSecurityItem(new SecurityRequirement().addList("Organization-id"));
    }
}
