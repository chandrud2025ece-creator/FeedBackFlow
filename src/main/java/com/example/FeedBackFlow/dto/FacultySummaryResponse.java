package com.example.FeedBackFlow.dto;

import java.util.List;

public class FacultySummaryResponse {

    private String facultyName;
    private List<CourseSummaryDto> courses;

    public FacultySummaryResponse() {
    }

    public FacultySummaryResponse(String facultyName, List<CourseSummaryDto> courses) {
        this.facultyName = facultyName;
        this.courses = courses;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public List<CourseSummaryDto> getCourses() {
        return courses;
    }

    public void setCourses(List<CourseSummaryDto> courses) {
        this.courses = courses;
    }
}
