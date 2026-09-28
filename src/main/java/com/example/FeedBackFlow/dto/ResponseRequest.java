package com.example.FeedBackFlow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class ResponseRequest {

    @NotBlank
    private String studentId;

    @NotEmpty
    @Valid
    private List<RatingRequest> ratings;

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public List<RatingRequest> getRatings() {
        return ratings;
    }

    public void setRatings(List<RatingRequest> ratings) {
        this.ratings = ratings;
    }
}
