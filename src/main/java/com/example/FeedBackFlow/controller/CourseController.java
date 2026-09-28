package com.example.FeedBackFlow.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.FeedBackFlow.dto.CourseRequest;
import com.example.FeedBackFlow.dto.FeedbackFormRequest;
import com.example.FeedBackFlow.dto.FeedbackFormResponse;
import com.example.FeedBackFlow.entity.Course;
import com.example.FeedBackFlow.service.CourseService;
import com.example.FeedBackFlow.service.FeedbackFormService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final FeedbackFormService feedbackFormService;

    public CourseController(CourseService courseService, FeedbackFormService feedbackFormService) {
        this.courseService = courseService;
        this.feedbackFormService = feedbackFormService;
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@Valid @RequestBody CourseRequest request) {
        Course savedCourse = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCourse);
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        Course updatedCourse = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{courseId}/forms")
    public ResponseEntity<FeedbackFormResponse> createFeedbackForm(
            @PathVariable Long courseId,
            @Valid @RequestBody FeedbackFormRequest request) {
        FeedbackFormResponse savedForm = feedbackFormService.createFeedbackFormResponse(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedForm);
    }
}