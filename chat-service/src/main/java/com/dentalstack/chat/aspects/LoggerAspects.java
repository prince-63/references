package com.dentalstack.chat.aspects;

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

    @Around("execution(* com.dentalstack.chat..*.*(..)) && " + "!within(org.springframework.web.filter..*) && "
            + "!within(*..*Filter)")
    public Object log(ProceedingJoinPoint joinPoint) throws Throwable {

        log.info("{} method execution start", joinPoint.getSignature());

        Instant start = Instant.now();
        Object returnObj = joinPoint.proceed();
        Instant end = Instant.now();

        long timeElapsed = Duration.between(start, end).toMillis();

        log.info("Time took to execute {} method is : {} ms", joinPoint.getSignature(), timeElapsed);

        log.info("{} method execution end", joinPoint.getSignature());

        return returnObj;
    }

    @AfterThrowing(
            value = "execution(* com.dentalstack.chat..*.*(..)) && " + "!within(org.springframework.web.filter..*) && "
                    + "!within(*..*Filter)",
            throwing = "ex")
    void logException(JoinPoint joinPoint, Exception ex) {
        log.error("{} exception occurred: {}", joinPoint.getSignature(), ex.getMessage(), ex);
    }
}
