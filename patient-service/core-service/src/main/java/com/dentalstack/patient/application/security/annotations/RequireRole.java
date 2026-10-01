package com.dentalstack.patient.application.security.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {

    UserRole[] value();

    boolean requireAll() default false;

    String message() default "Access denied: Insufficient role privileges";
}
