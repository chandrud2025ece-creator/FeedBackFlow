package com.example.FeedBackFlow.service;

import com.example.FeedBackFlow.dto.CourseRequest;
import com.example.FeedBackFlow.entity.Course;
import com.example.FeedBackFlow.exception.BusinessException;
import com.example.FeedBackFlow.exception.DuplicateCourseException;
import com.example.FeedBackFlow.exception.ResourceNotFoundException;
import com.example.FeedBackFlow.repository.CourseRepository;
import com.example.FeedBackFlow.repository.FeedbackFormRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final FeedbackFormRepository feedbackFormRepository;

    public CourseService(CourseRepository courseRepository, FeedbackFormRepository feedbackFormRepository) {
        this.courseRepository = courseRepository;
        this.feedbackFormRepository = feedbackFormRepository;
    }

    @Transactional
    public Course createCourse(CourseRequest request) {
        if (request.getCourseCode() != null && courseRepository.existsByCourseCodeIgnoreCase(request.getCourseCode().trim())) {
            throw new DuplicateCourseException("Course code already exists: " + request.getCourseCode());
        }

        Course course = new Course();
        course.setCourseCode(request.getCourseCode().trim());
        course.setCourseName(request.getCourseName().trim());
        course.setFacultyName(request.getFacultyName().trim());
        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Transactional
    public Course updateCourse(Long id, CourseRequest request) {
        Course course = getCourseById(id);
        String newCode = request.getCourseCode().trim();

        if (courseRepository.existsByCourseCodeIgnoreCaseAndIdNot(newCode, id)) {
            throw new DuplicateCourseException("Course code already exists: " + newCode);
        }

        course.setCourseCode(newCode);
        course.setCourseName(request.getCourseName().trim());
        course.setFacultyName(request.getFacultyName().trim());
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        if (!feedbackFormRepository.findByCourseId(course.getId()).isEmpty()) {
            throw new BusinessException("Cannot delete course with associated feedback forms.");
        }
        courseRepository.delete(course);
    }
}