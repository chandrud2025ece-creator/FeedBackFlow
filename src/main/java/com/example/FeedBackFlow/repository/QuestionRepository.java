package com.example.FeedBackFlow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.FeedBackFlow.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByFeedbackFormId(Long feedbackFormId);
}