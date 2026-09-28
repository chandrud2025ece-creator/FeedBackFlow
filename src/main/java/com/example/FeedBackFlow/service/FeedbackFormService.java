package com.example.FeedBackFlow.service;

import com.example.FeedBackFlow.dto.CourseResponseDto;
import com.example.FeedBackFlow.dto.FeedbackFormRequest;
import com.example.FeedBackFlow.dto.FeedbackFormResponse;
import com.example.FeedBackFlow.dto.QuestionRequest;
import com.example.FeedBackFlow.dto.QuestionResponseDto;
import com.example.FeedBackFlow.entity.Course;
import com.example.FeedBackFlow.entity.FeedbackForm;
import com.example.FeedBackFlow.entity.Question;
import com.example.FeedBackFlow.exception.ResourceNotFoundException;
import com.example.FeedBackFlow.repository.CourseRepository;
import com.example.FeedBackFlow.repository.FeedbackFormRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class FeedbackFormService {

    private final FeedbackFormRepository feedbackFormRepository;
    private final CourseRepository courseRepository;

    public FeedbackFormService(FeedbackFormRepository feedbackFormRepository, CourseRepository courseRepository) {
        this.feedbackFormRepository = feedbackFormRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public FeedbackForm createFeedbackForm(Long courseId, FeedbackFormRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        FeedbackForm form = new FeedbackForm();
        form.setSemester(request.getSemester());
        form.setClosingDate(request.getClosingDate());
        form.setClosed(false);
        form.setCourse(course);

        List<Question> questions = new ArrayList<>();
        if (request.getQuestions() != null) {
            for (QuestionRequest qr : request.getQuestions()) {
                Question question = new Question();
                question.setQuestionText(qr.getQuestionText());
                question.setFeedbackForm(form);
                questions.add(question);
            }
        }
        form.setQuestions(questions);

        return feedbackFormRepository.save(form);
    }

    @Transactional
    public FeedbackFormResponse createFeedbackFormResponse(Long courseId, FeedbackFormRequest request) {
        FeedbackForm savedForm = createFeedbackForm(courseId, request);
        return mapToResponse(savedForm);
    }

    @Transactional(readOnly = true)
    public FeedbackFormResponse getFeedbackForm(Long formId) {
        FeedbackForm form = feedbackFormRepository.findByIdWithQuestions(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback form not found with id: " + formId));

        return mapToResponse(form);
    }

    @Transactional(readOnly = true)
    public List<FeedbackFormResponse> getAllFeedbackForms() {
        List<FeedbackForm> forms = feedbackFormRepository.findAllWithQuestions();
        List<FeedbackFormResponse> responses = new ArrayList<>();
        for (FeedbackForm f : forms) {
            responses.add(mapToResponse(f));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public FeedbackForm getFormById(Long formId) {
        return feedbackFormRepository.findByIdWithQuestions(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback form not found with id: " + formId));
    }

    @Transactional
    public FeedbackForm closeFeedbackForm(Long formId) {
        FeedbackForm form = getFormById(formId);
        form.setClosed(true);
        return feedbackFormRepository.save(form);
    }

    @Transactional
    public FeedbackFormResponse closeFeedbackFormResponse(Long formId) {
        FeedbackForm closedForm = closeFeedbackForm(formId);
        return mapToResponse(closedForm);
    }

    public FeedbackFormResponse mapToResponse(FeedbackForm form) {
        CourseResponseDto courseDto = null;
        if (form.getCourse() != null) {
            courseDto = new CourseResponseDto(
                    form.getCourse().getId(),
                    form.getCourse().getCourseCode(),
                    form.getCourse().getCourseName(),
                    form.getCourse().getFacultyName()
            );
        }

        List<QuestionResponseDto> questionDtos = new ArrayList<>();
        if (form.getQuestions() != null) {
            for (Question q : form.getQuestions()) {
                questionDtos.add(new QuestionResponseDto(q.getId(), q.getQuestionText()));
            }
        }

        return new FeedbackFormResponse(
                form.getId(),
                form.getSemester(),
                form.getClosingDate(),
                form.isClosed(),
                courseDto,
                questionDtos
        );
    }
}
