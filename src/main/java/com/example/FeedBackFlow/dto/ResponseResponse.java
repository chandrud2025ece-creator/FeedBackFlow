package com.example.FeedBackFlow.dto;

import java.time.LocalDateTime;

public class ResponseResponse {

    private Long id;
    private String studentId;
    private LocalDateTime submittedAt;
    private Long feedbackFormId;

    public ResponseResponse() {
    }

    public ResponseResponse(Long id, String studentId, LocalDateTime submittedAt, Long feedbackFormId) {
        this.id = id;
        this.studentId = studentId;
        this.submittedAt = submittedAt;
        this.feedbackFormId = feedbackFormId;
    }

    public Long getId() {
        return id;
    }

    public String getStudentId() {
        return studentId;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public Long getFeedbackFormId() {
        return feedbackFormId;
    }
}