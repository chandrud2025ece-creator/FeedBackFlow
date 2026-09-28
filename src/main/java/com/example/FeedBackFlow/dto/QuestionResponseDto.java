package com.example.FeedBackFlow.dto;

public class QuestionResponseDto {

    private Long id;
    private String questionText;

    public QuestionResponseDto() {
    }

    public QuestionResponseDto(Long id, String questionText) {
        this.id = id;
        this.questionText = questionText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
}
