package com.example.SPRING_4.Controller;

import com.example.SPRING_4.model.Student;
import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController//TASK 1
@RequestMapping("/api/students")
public class StudentController {
    private static final List<Student> students = new ArrayList<>(
            List.of(
            new Student(1, "abc", 231),
            new Student(2, "ab", 2314),
            new Student(3, "abcd", 23),
            new Student(4, "abcdfas", 21)
            )
    );

    @GetMapping//TASK 2
    public List<Student> getStudents() {
        return students;
    }

    @GetMapping("/{id}")//TASK 3
    public ResponseEntity<Student> getStudentById(@PathVariable int id) {
        for (Student student : students) {
            if (student.getId() == id) {
                return ResponseEntity.ok(student);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")//TASK 4
    public ResponseEntity<List<Student>> searchStudents(@RequestParam String name) {
        List<Student> result = students.stream()
                .filter(student -> student.getName().equalsIgnoreCase(name))
                .toList();
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }
    @PostMapping//TASK 5
    public ResponseEntity<Student> addStudent(@RequestBody Student student){
        students.add(student);
        return ResponseEntity.status(201).body(student);
    }
    @PutMapping("/{id}")//TASK 6
    public ResponseEntity<Student> updateStudent(@PathVariable int id,@RequestBody Student updatedStudent){
        for(Student student : students){
            if(student.getId()==id){
                student.setName(updatedStudent.getName());
                student.setAge(updatedStudent.getAge());
               return ResponseEntity.ok(student);
            }
        }
        return ResponseEntity.notFound().build();
    }
    @DeleteMapping("/{id}")//TASK 7
    public ResponseEntity<Student> deleteStudent(@PathVariable int id){
        for(Student student:students){
            if(student.getId()==id){
                students.remove(student);
                return  ResponseEntity.noContent().build();
            }
        }
        return ResponseEntity.notFound().build();
    }
}
//TASK 8: WRAPPED EVERYTHING UNDER RESPONSE ENTITIES TO CHECK STATUS CODES.
//TASK 9: CHECKED EVERYTHING IN POSTMAN.