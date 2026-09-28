package com.example.FeedBackFlow.repository;

import com.example.FeedBackFlow.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByFacultyNameIgnoreCase(String facultyName);
    Optional<Course> findByCourseCodeIgnoreCase(String courseCode);
    boolean existsByCourseCodeIgnoreCase(String courseCode);
    boolean existsByCourseCodeIgnoreCaseAndIdNot(String courseCode, Long id);
}