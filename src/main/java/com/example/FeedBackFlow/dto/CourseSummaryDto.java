package com.example.FeedBackFlow.dto;

public class CourseSummaryDto {

    private String courseCode;
    private String courseName;
    private String semester;
    private double overallAverage;

    public CourseSummaryDto() {
    }

    public CourseSummaryDto(String courseCode, String courseName, String semester, double overallAverage) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.semester = semester;
        this.overallAverage = overallAverage;
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

    public double getOverallAverage() {
        return overallAverage;
    }

    public void setOverallAverage(double overallAverage) {
        this.overallAverage = overallAverage;
    }
}
