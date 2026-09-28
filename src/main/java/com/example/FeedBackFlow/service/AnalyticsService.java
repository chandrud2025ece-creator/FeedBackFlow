package com.example.FeedBackFlow.service;

import com.example.FeedBackFlow.dto.CourseSummaryDto;
import com.example.FeedBackFlow.dto.FacultySummaryResponse;
import com.example.FeedBackFlow.dto.FormAnalyticsResponse;
import com.example.FeedBackFlow.dto.QuestionAnalyticsDto;
import com.example.FeedBackFlow.entity.FeedbackForm;
import com.example.FeedBackFlow.entity.Question;
import com.example.FeedBackFlow.entity.ResponseAnswer;
import com.example.FeedBackFlow.exception.ResourceNotFoundException;
import com.example.FeedBackFlow.repository.FeedbackFormRepository;
import com.example.FeedBackFlow.repository.QuestionRepository;
import com.example.FeedBackFlow.repository.ResponseAnswerRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    private final FeedbackFormRepository feedbackFormRepository;
    private final QuestionRepository questionRepository;
    private final ResponseAnswerRepository responseAnswerRepository;

    public AnalyticsService(FeedbackFormRepository feedbackFormRepository,
                            QuestionRepository questionRepository,
                            ResponseAnswerRepository responseAnswerRepository) {
        this.feedbackFormRepository = feedbackFormRepository;
        this.questionRepository = questionRepository;
        this.responseAnswerRepository = responseAnswerRepository;
    }

    public FormAnalyticsResponse getFormAnalytics(Long formId) {
        FeedbackForm form = feedbackFormRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback form not found with id: " + formId));

        List<Question> questions = questionRepository.findByFeedbackFormId(formId);
        List<QuestionAnalyticsDto> questionAnalyticsList = new ArrayList<>();

        for (Question question : questions) {
            List<ResponseAnswer> answers = responseAnswerRepository.findByQuestionId(question.getId());
            double total = 0;
            int count = 0;

            for (ResponseAnswer answer : answers) {
                total += answer.getRating();
                count++;
            }

            double average = count == 0 ? 0.0 : total / count;
            average = Math.round(average * 100.0) / 100.0;

            QuestionAnalyticsDto dto = new QuestionAnalyticsDto(question.getId(), question.getQuestionText(), average);
            questionAnalyticsList.add(dto);
        }

        List<ResponseAnswer> allFormAnswers = responseAnswerRepository.findByResponseFeedbackFormId(formId);
        double grandTotal = 0;
        int grandCount = 0;

        for (ResponseAnswer answer : allFormAnswers) {
            grandTotal += answer.getRating();
            grandCount++;
        }

        double overallAverage = grandCount == 0 ? 0.0 : grandTotal / grandCount;
        overallAverage = Math.round(overallAverage * 100.0) / 100.0;

        return new FormAnalyticsResponse(
                form.getId(),
                form.getCourse().getCourseCode(),
                form.getCourse().getCourseName(),
                form.getSemester(),
                questionAnalyticsList,
                overallAverage
        );
    }

    public FacultySummaryResponse getFacultySummary(String facultyName) {
        List<FeedbackForm> forms = feedbackFormRepository.findByCourseFacultyNameIgnoreCase(facultyName);
        List<CourseSummaryDto> courseSummaries = new ArrayList<>();

        for (FeedbackForm form : forms) {
            List<ResponseAnswer> allFormAnswers = responseAnswerRepository.findByResponseFeedbackFormId(form.getId());
            double grandTotal = 0;
            int grandCount = 0;

            for (ResponseAnswer answer : allFormAnswers) {
                grandTotal += answer.getRating();
                grandCount++;
            }

            double overallAverage = grandCount == 0 ? 0.0 : grandTotal / grandCount;
            overallAverage = Math.round(overallAverage * 100.0) / 100.0;

            CourseSummaryDto summary = new CourseSummaryDto(
                    form.getCourse().getCourseCode(),
                    form.getCourse().getCourseName(),
                    form.getSemester(),
                    overallAverage
            );
            courseSummaries.add(summary);
        }

        return new FacultySummaryResponse(facultyName, courseSummaries);
    }
}
