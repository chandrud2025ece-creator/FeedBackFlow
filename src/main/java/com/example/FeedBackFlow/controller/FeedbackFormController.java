package com.example.FeedBackFlow.controller;

import com.example.FeedBackFlow.dto.FeedbackFormResponse;
import com.example.FeedBackFlow.dto.FormAnalyticsResponse;
import com.example.FeedBackFlow.dto.ResponseRequest;
import com.example.FeedBackFlow.dto.ResponseResponse;
import com.example.FeedBackFlow.service.AnalyticsService;
import com.example.FeedBackFlow.service.FeedbackFormService;
import com.example.FeedBackFlow.service.ResponseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
public class FeedbackFormController {

    private final ResponseService responseService;
    private final AnalyticsService analyticsService;
    private final FeedbackFormService feedbackFormService;

    public FeedbackFormController(ResponseService responseService,
                                   AnalyticsService analyticsService,
                                   FeedbackFormService feedbackFormService) {
        this.responseService = responseService;
        this.analyticsService = analyticsService;
        this.feedbackFormService = feedbackFormService;
    }

    @PostMapping("/{formId}/responses")
    public ResponseEntity<ResponseResponse> submitResponse(
            @PathVariable Long formId,
            @Valid @RequestBody ResponseRequest request) {
        ResponseResponse savedResponse = responseService.submitResponse(formId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedResponse);
    }

    @GetMapping
    public ResponseEntity<List<FeedbackFormResponse>> getAllForms() {
        List<FeedbackFormResponse> forms = feedbackFormService.getAllFeedbackForms();
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/{formId}")
    public ResponseEntity<FeedbackFormResponse> getFeedbackForm(@PathVariable Long formId) {
        FeedbackFormResponse form = feedbackFormService.getFeedbackForm(formId);
        return ResponseEntity.ok(form);
    }

    @GetMapping("/{formId}/analytics")
    public ResponseEntity<FormAnalyticsResponse> getFormAnalytics(@PathVariable Long formId) {
        FormAnalyticsResponse analytics = analyticsService.getFormAnalytics(formId);
        return ResponseEntity.ok(analytics);
    }

    @PutMapping("/{formId}/close")
    public ResponseEntity<FeedbackFormResponse> closeFeedbackForm(@PathVariable Long formId) {
        FeedbackFormResponse closedForm = feedbackFormService.closeFeedbackFormResponse(formId);
        return ResponseEntity.ok(closedForm);
    }
}

