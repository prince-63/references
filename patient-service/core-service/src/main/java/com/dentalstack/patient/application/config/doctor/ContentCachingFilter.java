package com.dentalstack.patient.application.config.doctor;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

public class ContentCachingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(ContentCachingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (hasRequestBody(request) && !isAlreadyWrapped(request)) {
            try {
                CachedBodyHttpServletRequest wrappedRequest = new CachedBodyHttpServletRequest(request);
                filterChain.doFilter(wrappedRequest, response);
            } catch (IOException e) {

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

    private boolean isAlreadyWrapped(HttpServletRequest request) {

        if (request instanceof CachedBodyHttpServletRequest) {
            return true;
        }

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

        return path.startsWith("/patient/profile/v1/")
                || path.startsWith("/patient/unassigned/v1/auth/register")
                || path.startsWith("/patient/subscription/v1/deactivate-subscription")
                || path.startsWith("/actuator")
                || path.startsWith("/patient/chargebee/v1/create/customer/subscription");
    }
}
