package com.dentalstack.doctor.config.doctor;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter to wrap HTTP requests with CachedBodyHttpServletRequest
 * This allows the request body to be read multiple times
 */
public class ContentCachingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(ContentCachingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Only wrap requests that might have a body and are not already wrapped
        if (hasRequestBody(request) && !isAlreadyWrapped(request)) {
            try {
                CachedBodyHttpServletRequest wrappedRequest = new CachedBodyHttpServletRequest(request);
                filterChain.doFilter(wrappedRequest, response);
            } catch (IOException e) {
                // Fall back to original request
                filterChain.doFilter(request, response);
            }
        } else {
            hasRequestBody(request);
            filterChain.doFilter(request, response);
        }
    }

    private boolean hasRequestBody(HttpServletRequest request) {
        String method = request.getMethod();
        return HttpMethod.POST.matches(method)
                || HttpMethod.PUT.matches(method)
                || HttpMethod.DELETE.matches(method)
                || HttpMethod.PATCH.matches(method);
    }

    /**
     * Check if request is already wrapped with our custom wrapper
     */
    private boolean isAlreadyWrapped(HttpServletRequest request) {
        // Check direct instance
        if (request instanceof CachedBodyHttpServletRequest) {
            return true;
        }

        // Check wrapper chain
        HttpServletRequest currentRequest = request;
        int depth = 0;
        while (currentRequest instanceof jakarta.servlet.http.HttpServletRequestWrapper && depth < 10) {
            currentRequest =
                    (HttpServletRequest) ((jakarta.servlet.http.HttpServletRequestWrapper) currentRequest).getRequest();
            if (currentRequest instanceof CachedBodyHttpServletRequest) {
                return true;
            }
            depth++;
        }
        return false;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();

        // Skip wrapping for paths that d   on't need body validation
        return path.startsWith("/patient/profile/v1/")
                || path.startsWith("/patient/unassigned/v1/auth/register")
                || path.startsWith("/doctor/billing/v1")
                || path.startsWith("/doctor")
                || path.startsWith("/patient/chargebee/v1/create/customer/subscription");
    }
}
