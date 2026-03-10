package org.example.config;
import org.example.service.MessageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
@Configuration
@ComponentScan(basePackages = "org.example")
public class AppConfig {
    @Bean
    public MessageService messageService(){
        return new MessageService();
    }
}
