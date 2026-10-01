package com.dentalstack.auth.ratelimit;

import com.dentalstack.auth.entity.organization.AuthOrganization;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class RateLimiter {

    private final Map<String, Bucket> orgBuckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(AuthOrganization organization) {
        return orgBuckets.computeIfAbsent(organization.getName(), name -> createBucket(organization));
    }

    private Bucket createBucket(AuthOrganization organization) {
        Bandwidth limit = Bandwidth.classic(
                organization.getRequestsPerMinute(),
                Refill.intervally(organization.getRequestsPerMinute(), Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    public void updateBucketRateLimit(AuthOrganization organization) {
        orgBuckets.remove(organization.getName());
    }
}
