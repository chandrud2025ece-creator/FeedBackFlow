package com.example.FeedBackFlow.repository;

import com.example.FeedBackFlow.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Long> {
    boolean existsByStudentIdAndFeedbackFormCourseIdAndFeedbackFormSemester(String studentId, Long courseId, String semester);
    boolean existsByStudentIdAndFeedbackFormId(String studentId, Long feedbackFormId);
    List<Response> findByFeedbackFormId(Long feedbackFormId);
}