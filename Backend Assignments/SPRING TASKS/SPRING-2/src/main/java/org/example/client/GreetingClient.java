package org.example.client;
import org.example.service.GreetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
@Component
public class GreetingClient {
  @Autowired
  private GreetingService greetingService;
  public void sendGreeting(){
      greetingService.greet();
  }

}
