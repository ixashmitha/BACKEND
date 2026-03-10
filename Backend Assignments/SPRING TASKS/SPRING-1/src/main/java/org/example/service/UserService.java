package org.example.service;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

public class UserService implements InitializingBean, DisposableBean {
    private UserRepository repo;
    public UserService(UserRepository repo){
        this.repo=repo;
        System.out.println("Bean constructer created");
    }
   @PostConstruct
    public void initialization(){
        System.out.println("Postconstruct executed");
   }
    @Override
    public void afterPropertiesSet() {
        System.out.println("afterPropertiesSet executed");
    }

    public void processUser() {
        System.out.println("Bean is ready and working");
        repo.saveUser();
    }
    @PreDestroy
    public void cleanup() {
        System.out.println("PreDestroy executed");
    }
    @Override
    public void destroy() {
        System.out.println("destroy executed");
    }
}
