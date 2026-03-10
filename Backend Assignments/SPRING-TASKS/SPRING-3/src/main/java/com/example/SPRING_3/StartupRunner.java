package com.example.SPRING_3;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
@Component
public class StartupRunner {
    @Value("${app.name}")
    private String appName;
//    @Override
//    public void run(String... args) throws Exception{
//        System.out.println("Application Name:"+ appName);
//    }
    @PostConstruct
    public void init(){
        System.out.println(" Application Name: "+ appName);
    }
}
//DAY -3 TASK 5