package com.example.FeedBackFlow.dto;

import java.util.List;

public class FormAnalyticsResponse {

    private Long formId;
    private String courseCode;
    private String courseName;
    private String semester;
    private List<QuestionAnalyticsDto> questions;
    private double overallAverage;

    public FormAnalyticsResponse() {
    }

    public FormAnalyticsResponse(Long formId, String courseCode, String courseName, String semester, List<QuestionAnalyticsDto> questions, double overallAverage) {
        this.formId = formId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.semester = semester;
        this.questions = questions;
        this.overallAverage = overallAverage;
    }

    public Long getFormId() {
        return formId;
    }

    public void setFormId(Long formId) {
        this.formId = formId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public List<QuestionAnalyticsDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionAnalyticsDto> questions) {
        this.questions = questions;
    }

    public double getOverallAverage() {
        return overallAverage;
    }

    public void setOverallAverage(double overallAverage) {
        this.overallAverage = overallAverage;
    }
}
