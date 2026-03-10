package org.example;

import org.example.config.AppConfig;
import org.example.service.UserService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class MainApp {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context=
                new AnnotationConfigApplicationContext(AppConfig.class);
//        UserService service=context.getBean(UserService.class);
//        service.processUser();
//        context.close();
        context.close();
      // CONSTRUCTOR INJECTION ERROR:
        // Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'beanB' defined in org.example.config.AppConfig:
        // Failed to instantiate [org.example.service.B]: Factory method 'beanB' threw exception with message: Error creating bean with name 'beanA' defined in org.example.config.AppConfig:
        // Failed to instantiate [org.example.service.A]: Factory method 'beanA' threw exception with message: Error creating bean with name 'beanB' defined in org.example.config.AppConfig:
        // Failed to instantiate [org.example.service.B]: Factory method 'beanB' threw exception with message: Error creating bean with name 'beanA' defined in org.example.config.AppConfig:
        // Failed to instantiate [org.example.service.A]: Factory method 'beanA' threw exception with message: null

    }
}