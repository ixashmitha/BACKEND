package com.example.SPRING_5.controller;

import com.example.SPRING_5.model.Student;
import com.example.SPRING_5.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/students")
public class studentController {
    @Autowired
    private StudentRepository repository;
    @GetMapping
    public List<Student> getAll(){
        return repository.findAll();
    }
    @PostMapping("/batch")
    public List<Student> addAll(@RequestBody List<Student> student){
        return  repository.saveAll(student);
    }
    @GetMapping("/{id}")
    public Optional<Student> getById(@PathVariable Long id){
        return repository.findById(id);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        repository.deleteById(id);
    }
    @PutMapping("/{id}")
    public Student update(@PathVariable Long id,@RequestBody Student updated){
        updated.setId(id);
        return repository.save(updated);
    }
    @GetMapping("/search")
    public List<Student> getByName(@RequestParam String name){
        return repository.findByName(name);
    }
    @GetMapping("/older-than")
    public List<Student> getOlderThan(@RequestParam int age) {
        return repository.findStudentsOlderThan(age);
    }
    @GetMapping("/name-and-Id")
    public List<Student> getByNameAndId(@RequestParam String name,@RequestParam Long id){
        return repository.findStudentsByNameAndId(name,id);
    }
}
