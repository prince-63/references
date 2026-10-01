package com.dentalstack.patient.feature.api_registry.initializer;

import com.dentalstack.patient.feature.api_registry.entity.ApiRegistry;
import com.dentalstack.patient.feature.api_registry.repository.ApiRegistryRepository;
import java.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Slf4j
@Component()
@ConditionalOnProperty(prefix = "api.registry", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ApiRegistryInitializer implements CommandLineRunner {

    private static final String REDIS_API_CACHE_KEY = "api:registry:cache";

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping handlerMapping;

    @Autowired
    private ApiRegistryRepository repository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private String buildKey(String path, String method) {
        return method + "|" + path;
    }

    @Override
    public void run(String... args) {
        log.info("Initializing API Registry with Redis cache");
        repository.findAll().forEach(api -> {
            String key = buildKey(api.getPath(), api.getMethod());
            redisTemplate.opsForHash().put(REDIS_API_CACHE_KEY, key, api);
        });

        Map<RequestMappingInfo, HandlerMethod> map = handlerMapping.getHandlerMethods();
        List<ApiRegistry> newApis = new ArrayList<>();
        Set<String> existingKeys = new HashSet<>();
        redisTemplate.opsForHash().keys(REDIS_API_CACHE_KEY).forEach(key -> existingKeys.add((String) key));

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : map.entrySet()) {
            RequestMappingInfo info = entry.getKey();
            HandlerMethod method = entry.getValue();

            Set<String> patterns = new HashSet<>();
            if (info.getPathPatternsCondition() != null) {
                info.getPathPatternsCondition().getPatterns().forEach(p -> patterns.add(p.getPatternString()));
            } else if (info.getPatternsCondition() != null) {
                patterns.addAll(info.getPatternsCondition().getPatterns());
            }

            Set<org.springframework.web.bind.annotation.RequestMethod> httpMethods =
                    info.getMethodsCondition().getMethods();
            if (httpMethods.isEmpty()) {
                httpMethods = Set.of(
                        org.springframework.web.bind.annotation.RequestMethod.GET,
                        org.springframework.web.bind.annotation.RequestMethod.POST,
                        org.springframework.web.bind.annotation.RequestMethod.PUT,
                        org.springframework.web.bind.annotation.RequestMethod.DELETE,
                        org.springframework.web.bind.annotation.RequestMethod.PATCH);
            }

            for (String path : patterns) {
                for (org.springframework.web.bind.annotation.RequestMethod httpMethod : httpMethods) {
                    String key = buildKey(path, httpMethod.name());

                    if (!existingKeys.contains(key)) {
                        String handlerName = method.getBeanType().getName() + "."
                                + method.getMethod().getName();
                        ApiRegistry api = ApiRegistry.builder()
                                .serviceName("patient-service")
                                .path(path)
                                .method(httpMethod.name())
                                .handler(handlerName)
                                .hitCount(0L)
                                .build();

                        newApis.add(api);
                        existingKeys.add(key);
                        redisTemplate.opsForHash().put(REDIS_API_CACHE_KEY, key, api);
                    }
                }
            }
        }

        if (!newApis.isEmpty()) {
            repository.saveAll(newApis);
            log.info("Saved {} new APIs to Redis cache", newApis.size());
        }

        log.info("API Registry initialization completed");
    }
}
