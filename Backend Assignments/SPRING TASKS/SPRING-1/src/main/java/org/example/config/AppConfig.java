package org.example.config;


import org.example.repository.UserRepository;
import org.example.service.UserService;
import org.example.service.A;
import org.example.service.B;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    //TASK 2 DAY 1
//@Bean
//    public UserRepository userRepository(){
//    return new UserRepository();
//}
//@Bean
//    public UserService userService(){
//    return new UserService(userRepository());
//}
    //CONSTRUCTOR INJECTION TASK 3 DAY 1
//    @Bean
//    public A beanA() {
//        return new A(beanB());
//    }
//    @Bean
//    public B beanB() {
//        return new B(beanA());
//    }
    //TASK 3 DAY 1
@Bean
public A beanA() {
    return new A();
}
@Bean
    public B beanB() {
        return new B();
    }
}
