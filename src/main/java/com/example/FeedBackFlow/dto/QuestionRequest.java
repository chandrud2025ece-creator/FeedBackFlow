package com.example.FeedBackFlow.dto;

import jakarta.validation.constraints.NotBlank;

public class QuestionRequest {

    @NotBlank
    private String questionText;

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
}