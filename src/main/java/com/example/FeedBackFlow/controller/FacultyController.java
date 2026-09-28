package com.example.FeedBackFlow.controller;

import com.example.FeedBackFlow.dto.FacultySummaryResponse;
import com.example.FeedBackFlow.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final AnalyticsService analyticsService;

    public FacultyController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/{facultyName}/summary")
    public ResponseEntity<FacultySummaryResponse> getFacultySummary(@PathVariable String facultyName) {
        FacultySummaryResponse summary = analyticsService.getFacultySummary(facultyName);
        return ResponseEntity.ok(summary);
    }
}
