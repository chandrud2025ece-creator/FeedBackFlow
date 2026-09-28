package com.example.FeedBackFlow.dto;

public class QuestionAnalyticsDto {

    private Long questionId;
    private String question;
    private double averageRating;

    public QuestionAnalyticsDto() {
    }

    public QuestionAnalyticsDto(Long questionId, String question, double averageRating) {
        this.questionId = questionId;
        this.question = question;
        this.averageRating = averageRating;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}
