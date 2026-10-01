package com.dentalstack.auth.aspect;

import java.time.Duration;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LoggerAspects {

    @Around("execution(* com.dentalstack.auth.repository..*.*(..)) || "
            + "execution(* com.dentalstack.auth.service..*.*(..)) || "
            + "execution(* com.dentalstack.auth.controller..*.*(..))")
    public Object log(ProceedingJoinPoint joinPoint) throws Throwable {
        log.info("{} method execution start", joinPoint.getSignature().toString());
        Instant start = Instant.now();
        Object returnObj = joinPoint.proceed();
        Instant end = Instant.now();
        long timeElapsed = Duration.between(start, end).toMillis();
        log.info(
                "Time took to execute {} method is : {}",
                joinPoint.getSignature().toString(),
                timeElapsed);
        log.info("{} method execution end", joinPoint.getSignature().toString());
        return returnObj;
    }

    @AfterThrowing(
            value = "execution(* com.dentalstack.auth.repository..*.*(..)) || "
                    + "execution(* com.dentalstack.auth.service..*.*(..)) || "
                    + "execution(* com.dentalstack.auth.controller..*.*(..))",
            throwing = "ex")
    void logException(JoinPoint joinPoint, Exception ex) {
        log.error("{} An exception happened due to : {}", joinPoint.getSignature(), ex.getMessage());
    }
}
