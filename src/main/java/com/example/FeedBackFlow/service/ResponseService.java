package com.example.FeedBackFlow.service;
import com.example.FeedBackFlow.dto.ResponseResponse;
import com.example.FeedBackFlow.dto.RatingRequest;
import com.example.FeedBackFlow.dto.ResponseRequest;
import com.example.FeedBackFlow.entity.FeedbackForm;
import com.example.FeedBackFlow.entity.Question;
import com.example.FeedBackFlow.entity.Response;
import com.example.FeedBackFlow.entity.ResponseAnswer;
import com.example.FeedBackFlow.exception.BusinessException;
import com.example.FeedBackFlow.exception.DuplicateResponseException;
import com.example.FeedBackFlow.exception.FeedbackClosedException;
import com.example.FeedBackFlow.exception.ResourceNotFoundException;
import com.example.FeedBackFlow.repository.FeedbackFormRepository;
import com.example.FeedBackFlow.repository.QuestionRepository;
import com.example.FeedBackFlow.repository.ResponseAnswerRepository;
import com.example.FeedBackFlow.repository.ResponseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ResponseService {

    private final ResponseRepository responseRepository;
    private final ResponseAnswerRepository responseAnswerRepository;
    private final FeedbackFormRepository feedbackFormRepository;
    private final QuestionRepository questionRepository;

    public ResponseService(ResponseRepository responseRepository,
                           ResponseAnswerRepository responseAnswerRepository,
                           FeedbackFormRepository feedbackFormRepository,
                           QuestionRepository questionRepository) {
        this.responseRepository = responseRepository;
        this.responseAnswerRepository = responseAnswerRepository;
        this.feedbackFormRepository = feedbackFormRepository;
        this.questionRepository = questionRepository;
    }

    public ResponseResponse submitResponse(Long formId, ResponseRequest request){
        FeedbackForm form = feedbackFormRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback form not found with id: " + formId));

        if (form.isClosed()) {
            throw new FeedbackClosedException("Feedback submission is closed.");
        }

        if (form.getClosingDate() != null && LocalDate.now().isAfter(form.getClosingDate())) {
            throw new FeedbackClosedException("Feedback submission is closed.");
        }

        boolean alreadySubmitted = responseRepository.existsByStudentIdAndFeedbackFormCourseIdAndFeedbackFormSemester(
                request.getStudentId(),
                form.getCourse().getId(),
                form.getSemester()
        ) || responseRepository.existsByStudentIdAndFeedbackFormId(request.getStudentId(), form.getId());

        if (alreadySubmitted) {
            throw new DuplicateResponseException("Student has already submitted feedback for this course and semester.");
        }

        for (RatingRequest ratingReq : request.getRatings()) {
            if (ratingReq.getRating() < 1 || ratingReq.getRating() > 5) {
                throw new BusinessException("Rating must be between 1 and 5.");
            }

            Question question = questionRepository.findById(ratingReq.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + ratingReq.getQuestionId()));

            if (!question.getFeedbackForm().getId().equals(form.getId())) {
                throw new BusinessException("Question does not belong to this feedback form.");
            }
        }

        Response response = new Response();
        response.setStudentId(request.getStudentId());
        response.setSubmittedAt(LocalDateTime.now());
        response.setFeedbackForm(form);
        Response savedResponse = responseRepository.save(response);

        for (RatingRequest ratingReq : request.getRatings()) {
            Question question = questionRepository.findById(ratingReq.getQuestionId()).get();

            ResponseAnswer answer = new ResponseAnswer();
            answer.setResponse(savedResponse);
            answer.setQuestion(question);
            answer.setRating(ratingReq.getRating());
            responseAnswerRepository.save(answer);
        }

        return new ResponseResponse(
                savedResponse.getId(),
                savedResponse.getStudentId(),
                savedResponse.getSubmittedAt(),
                savedResponse.getFeedbackForm().getId()
        );
    }
}
