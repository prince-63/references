package com.dentalstack.patient.feature.api_registry.interceptor;

import com.dentalstack.patient.feature.api_registry.entity.ApiRegistry;
import com.dentalstack.patient.feature.api_registry.repository.ApiRegistryRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class ApiUsageInterceptor implements HandlerInterceptor {

    private static final String REDIS_API_CACHE_KEY = "api:registry:cache";
    private static final String REDIS_HIT_COUNTS_KEY = "api:registry:hits";

    @Autowired
    private ApiRegistryRepository repository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private String buildKey(String path, String method) {
        return method + "|" + path;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod)) return true;

        String path = (String)
                request.getAttribute(org.springframework.web.servlet.HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String method = request.getMethod();
        String key = buildKey(path, method);

        redisTemplate.opsForHash().increment(REDIS_HIT_COUNTS_KEY, key, 1L);

        Object cachedApi = redisTemplate.opsForHash().get(REDIS_API_CACHE_KEY, key);
        if (cachedApi == null) {
            ApiRegistry api = repository.findByPathAndMethod(path, method);
            if (api != null) {
                redisTemplate.opsForHash().put(REDIS_API_CACHE_KEY, key, api);
            } else {
                String handlerName = ((HandlerMethod) handler).getBeanType().getName() + "."
                        + ((HandlerMethod) handler).getMethod().getName();
                api = ApiRegistry.builder()
                        .serviceName("patient-service")
                        .path(path)
                        .method(method)
                        .handler(handlerName)
                        .hitCount(0L)
                        .build();

                repository.save(api);
                redisTemplate.opsForHash().put(REDIS_API_CACHE_KEY, key, api);
            }
        }

        return true;
    }

    @Scheduled(cron = "0 0 0 * * *") // Midnight (00:00:00) every day
    @Transactional
    public void flushHitsToDb() {
        Map<Object, Object> hitCounts = redisTemplate.opsForHash().entries(REDIS_HIT_COUNTS_KEY);
        if (hitCounts.isEmpty()) {
            log.debug("No hit counts to flush at midnight");
            return;
        }

        hitCounts.forEach((keyObj, countObj) -> {
            String key = (String) keyObj;
            Long count = ((Number) countObj).longValue();

            String[] parts = key.split("\\|", 2);
            if (parts.length != 2) return;

            String method = parts[0];
            String path = parts[1];

            repository.incrementHitCount(path, method, count);
        });

        redisTemplate.delete(REDIS_HIT_COUNTS_KEY);
        log.info("Midnight flush completed. Flushed API hit counts to database");
    }
}
