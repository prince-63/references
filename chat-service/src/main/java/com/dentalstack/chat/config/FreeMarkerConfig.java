package com.dentalstack.chat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean;

@Configuration
public class FreeMarkerConfig {

    @Bean
    public FreeMarkerConfigurationFactoryBean freemarkerConfiguration() {
        FreeMarkerConfigurationFactoryBean configFactoryBean = new FreeMarkerConfigurationFactoryBean();

        // Set the template loader path to the classpath location of your templates
        configFactoryBean.setTemplateLoaderPath("classpath:/template/mail/");

        // You can set other FreeMarker properties here if needed

        return configFactoryBean;
    }
}
