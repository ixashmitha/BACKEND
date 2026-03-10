package org.example.service;
//USING CONSTRUCTOR INJECTION
//public class B {
//private A a;
//public B(A a){
//    this.a=a;
//    System.out.println("B created");
//
//}
// USING SETTER INJECTION
public class B {
    private A a;
    public B() {
        System.out.println("B created");
    }
    public void setA(A a) {
        this.a = a;
    }
}

