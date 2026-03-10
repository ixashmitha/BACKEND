package org.example.service;
//USING CONSTRUCTOR INJECTION
//public class A {
//    private B b;
//    public A(B b){
//        this.b=b;
//        System.out.println("A created");
//    }
//}
// USING SETTER INJECTION
public class A {
    private B b;
    public A() {
        System.out.println("A created");
    }
    public void setB(B b)
    {
        this.b = b;
    }
}