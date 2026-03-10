package org.example;
import org.example.client.GreetingClient;
import org.example.config.AppConfig;
import org.example.service.MessageService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) {
        //TASK 4 DAY-2
         AnnotationConfigApplicationContext context=
                 new AnnotationConfigApplicationContext(AppConfig.class);
         //TASK 2 DAY-2
         GreetingClient client=context.getBean(GreetingClient.class);
         client.sendGreeting();
         //TASK 3 DAY-2
        MessageService service=context.getBean(MessageService.class);
        service.sendMessage();
        context.close();
    }
}
//TASK 5 DAY-2
//WITHOUT SPRING: we have to create objects manually which creates tight coupling between classess.
//        GreetingService service = new GreetingService();
//        GreetingClient client = new GreetingClient(service);
//WITH SPRING: spring container manages object creation,updation and deletions.Also, Dependencies are automatically injected
//it enhances loose coupling between classess
// code with spring:
// @Autowired
//private GreetingService greetingService;
