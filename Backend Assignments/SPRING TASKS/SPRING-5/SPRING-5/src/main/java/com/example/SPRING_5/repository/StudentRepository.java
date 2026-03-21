package com.example.SPRING_5.repository;

import com.example.SPRING_5.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository//data access component
//extends-says studentsRepository is JpaRepo+anything extra(inheritance)
//interface-a blueprint of a class and a contract that defines a set of methods a class must implement
public interface StudentRepository extends JpaRepository<Student, Long> {
 List<Student> findByName(String name);
 List<Student> findStudentsByNameAndId(String name,Long Id);
 @Query("SELECT s From Student s WHERE s.age> :age")
    List<Student> findStudentsOlderThan(@Param("age") int age);
}

