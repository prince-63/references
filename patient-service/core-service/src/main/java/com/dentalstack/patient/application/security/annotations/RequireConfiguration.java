package com.dentalstack.patient.application.security.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireConfiguration {

    ServiceConfig[] value();

    boolean requireAll() default false;

    boolean enterpriseOnly() default true;

    String message() default "Access denied: Required service configuration not enabled";
}
