package com.example.FeedBackFlow.repository;

import com.example.FeedBackFlow.entity.ResponseAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResponseAnswerRepository extends JpaRepository<ResponseAnswer, Long> {
    List<ResponseAnswer> findByResponseFeedbackFormId(Long feedbackFormId);
    List<ResponseAnswer> findByQuestionId(Long questionId);
}