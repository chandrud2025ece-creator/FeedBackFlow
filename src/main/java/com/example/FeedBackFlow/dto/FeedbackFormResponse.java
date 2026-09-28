package com.example.FeedBackFlow.dto;

import java.time.LocalDate;
import java.util.List;

public class FeedbackFormResponse {

    private Long id;
    private String semester;
    private LocalDate closingDate;
    private boolean closed;
    private CourseResponseDto course;
    private List<QuestionResponseDto> questions;

    public FeedbackFormResponse() {
    }

    public FeedbackFormResponse(Long id, String semester, LocalDate closingDate, boolean closed, CourseResponseDto course, List<QuestionResponseDto> questions) {
        this.id = id;
        this.semester = semester;
        this.closingDate = closingDate;
        this.closed = closed;
        this.course = course;
        this.questions = questions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public LocalDate getClosingDate() {
        return closingDate;
    }

    public void setClosingDate(LocalDate closingDate) {
        this.closingDate = closingDate;
    }

    public boolean isClosed() {
        return closed;
    }

    public void setClosed(boolean closed) {
        this.closed = closed;
    }

    public CourseResponseDto getCourse() {
        return course;
    }

    public void setCourse(CourseResponseDto course) {
        this.course = course;
    }

    public List<QuestionResponseDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResponseDto> questions) {
        this.questions = questions;
    }
}
