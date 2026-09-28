package com.example.FeedBackFlow.repository;

import com.example.FeedBackFlow.entity.FeedbackForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedbackFormRepository extends JpaRepository<FeedbackForm, Long> {
    List<FeedbackForm> findByCourseId(Long courseId);
    List<FeedbackForm> findByCourseFacultyNameIgnoreCase(String facultyName);

    @Query("""
        SELECT DISTINCT f
        FROM FeedbackForm f
        LEFT JOIN FETCH f.questions
        LEFT JOIN FETCH f.course
        WHERE f.id = :id
    """)
    Optional<FeedbackForm> findByIdWithQuestions(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT f
        FROM FeedbackForm f
        LEFT JOIN FETCH f.questions
        LEFT JOIN FETCH f.course
        ORDER BY f.id DESC
    """)
    List<FeedbackForm> findAllWithQuestions();
}