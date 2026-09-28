package com.example.FeedBackFlow;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.FeedBackFlow.dto.CourseRequest;
import com.example.FeedBackFlow.dto.FacultySummaryResponse;
import com.example.FeedBackFlow.dto.FeedbackFormRequest;
import com.example.FeedBackFlow.dto.FormAnalyticsResponse;
import com.example.FeedBackFlow.dto.QuestionRequest;
import com.example.FeedBackFlow.dto.RatingRequest;
import com.example.FeedBackFlow.dto.ResponseRequest;
import com.example.FeedBackFlow.dto.ResponseResponse;
import com.example.FeedBackFlow.entity.Course;
import com.example.FeedBackFlow.entity.FeedbackForm;
import com.example.FeedBackFlow.exception.BusinessException;
import com.example.FeedBackFlow.exception.DuplicateResponseException;
import com.example.FeedBackFlow.exception.FeedbackClosedException;
import com.example.FeedBackFlow.exception.ResourceNotFoundException;
import com.example.FeedBackFlow.service.AnalyticsService;
import com.example.FeedBackFlow.service.CourseService;
import com.example.FeedBackFlow.service.FeedbackFormService;
import com.example.FeedBackFlow.service.ResponseService;

@SpringBootTest
class FeedBackFlowApplicationTests {

    @Autowired
    private CourseService courseService;

    @Autowired
    private FeedbackFormService feedbackFormService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private AnalyticsService analyticsService;

    @Test
    void testCreateCourse() {
        CourseRequest req = new CourseRequest();
        req.setCourseCode("CS101");
        req.setCourseName("Data Structures");
        req.setFacultyName("Dr. Smith");

        Course course = courseService.createCourse(req);
        assertNotNull(course.getId());
        assertEquals("CS101", course.getCourseCode());
    }

    @Test
    void testCreateFeedbackFormWithQuestions() {
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS102");
        courseReq.setCourseName("Database Systems");
        courseReq.setFacultyName("Dr. Kumar");
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now().plusDays(10));
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Clear explanations?");
        QuestionRequest q2 = new QuestionRequest();
        q2.setQuestionText("Useful assignments?");
        formReq.setQuestions(List.of(q1, q2));

        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);
        assertNotNull(form.getId());
        assertEquals(2, form.getQuestions().size());
    }

    @Test
    void testSubmitFeedbackSuccessfullyAndDuplicateCheck() {
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS103");
        courseReq.setCourseName("Web Tech");
        courseReq.setFacultyName("Prof. Alan");
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now().plusDays(5));
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Course content value?");
        formReq.setQuestions(List.of(q1));
        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);

        Long questionId = form.getQuestions().get(0).getId();

        ResponseRequest respReq = new ResponseRequest();
        respReq.setStudentId("STU001");
        RatingRequest r1 = new RatingRequest();
        r1.setQuestionId(questionId);
        r1.setRating(5);
        respReq.setRatings(List.of(r1));

        var response = responseService.submitResponse(form.getId(), respReq);
        assertNotNull(response);

        assertThrows(DuplicateResponseException.class, () -> {
            responseService.submitResponse(form.getId(), respReq);
        });
    }

    @Test
    void testSubmitAfterClosingDate() {
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS104");
        courseReq.setCourseName("Algorithms");
        courseReq.setFacultyName("Dr. Smith");
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now().minusDays(1));
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Pacing?");
        formReq.setQuestions(List.of(q1));
        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);

        Long questionId = form.getQuestions().get(0).getId();

        ResponseRequest respReq = new ResponseRequest();
        respReq.setStudentId("STU002");
        RatingRequest r1 = new RatingRequest();
        r1.setQuestionId(questionId);
        r1.setRating(4);
        respReq.setRatings(List.of(r1));

        assertThrows(FeedbackClosedException.class, () -> {
            responseService.submitResponse(form.getId(), respReq);
        });
    }

    @Test
    void testManualCloseAndSubmissionFailure() {
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS105");
        courseReq.setCourseName("OS");
        courseReq.setFacultyName("Dr. Smith");
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now().plusDays(10));
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Labs?");
        formReq.setQuestions(List.of(q1));
        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);

        FeedbackForm closedForm = feedbackFormService.closeFeedbackForm(form.getId());
        assertTrue(closedForm.isClosed());

        Long questionId = form.getQuestions().get(0).getId();
        ResponseRequest respReq = new ResponseRequest();
        respReq.setStudentId("STU003");
        RatingRequest r1 = new RatingRequest();
        r1.setQuestionId(questionId);
        r1.setRating(4);
        respReq.setRatings(List.of(r1));

        assertThrows(FeedbackClosedException.class, () -> {
            responseService.submitResponse(form.getId(), respReq);
        });
    }

    @Test
    void testInvalidRatings() {
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS106");
        courseReq.setCourseName("Networks");
        courseReq.setFacultyName("Dr. Lee");
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now().plusDays(10));
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Overall quality?");
        formReq.setQuestions(List.of(q1));
        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);

        Long questionId = form.getQuestions().get(0).getId();

        ResponseRequest zeroReq = new ResponseRequest();
        zeroReq.setStudentId("STU004");
        RatingRequest rZero = new RatingRequest();
        rZero.setQuestionId(questionId);
        rZero.setRating(0);
        zeroReq.setRatings(List.of(rZero));

        assertThrows(BusinessException.class, () -> {
            responseService.submitResponse(form.getId(), zeroReq);
        });

        ResponseRequest sixReq = new ResponseRequest();
        sixReq.setStudentId("STU005");
        RatingRequest rSix = new RatingRequest();
        rSix.setQuestionId(questionId);
        rSix.setRating(6);
        sixReq.setRatings(List.of(rSix));

        assertThrows(BusinessException.class, () -> {
            responseService.submitResponse(form.getId(), sixReq);
        });
    }

    @Test
    void testAnalyticsAndFacultySummary() {
        String uniqueFaculty = "Dr. Grace " + System.currentTimeMillis();
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS107");
        courseReq.setCourseName("Software Eng");
        courseReq.setFacultyName(uniqueFaculty);
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now().plusDays(10));
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Clarity");
        QuestionRequest q2 = new QuestionRequest();
        q2.setQuestionText("Support");
        formReq.setQuestions(List.of(q1, q2));
        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);

        Long q1Id = form.getQuestions().get(0).getId();
        Long q2Id = form.getQuestions().get(1).getId();

        ResponseRequest r1 = new ResponseRequest();
        r1.setStudentId("S10_" + System.currentTimeMillis());
        RatingRequest r1_q1 = new RatingRequest();
        r1_q1.setQuestionId(q1Id);
        r1_q1.setRating(5);
        RatingRequest r1_q2 = new RatingRequest();
        r1_q2.setQuestionId(q2Id);
        r1_q2.setRating(4);
        r1.setRatings(List.of(r1_q1, r1_q2));
        responseService.submitResponse(form.getId(), r1);

        ResponseRequest r2 = new ResponseRequest();
        r2.setStudentId("S11_" + System.currentTimeMillis());
        RatingRequest r2_q1 = new RatingRequest();
        r2_q1.setQuestionId(q1Id);
        r2_q1.setRating(3);
        RatingRequest r2_q2 = new RatingRequest();
        r2_q2.setQuestionId(q2Id);
        r2_q2.setRating(4);
        r2.setRatings(List.of(r2_q1, r2_q2));
        responseService.submitResponse(form.getId(), r2);

        FormAnalyticsResponse analytics = analyticsService.getFormAnalytics(form.getId());
        assertEquals(form.getId(), analytics.getFormId());
        assertEquals(4.0, analytics.getOverallAverage());
        assertEquals(4.0, analytics.getQuestions().get(0).getAverageRating());
        assertEquals(4.0, analytics.getQuestions().get(1).getAverageRating());

        FacultySummaryResponse facultySummary = analyticsService.getFacultySummary(uniqueFaculty);
        assertEquals(uniqueFaculty, facultySummary.getFacultyName());
        assertEquals(1, facultySummary.getCourses().size());
        assertEquals("CS107", facultySummary.getCourses().get(0).getCourseCode());
        assertEquals(4.0, facultySummary.getCourses().get(0).getOverallAverage());
    }

    @Test
    void testClosingDateTodaySubmissionAllowed() {
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS108");
        courseReq.setCourseName("Compiler Design");
        courseReq.setFacultyName("Dr. Alan");
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now());
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Course content clear?");
        formReq.setQuestions(List.of(q1));
        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);

        Long questionId = form.getQuestions().get(0).getId();
        ResponseRequest respReq = new ResponseRequest();
        respReq.setStudentId("STU088");
        RatingRequest r1 = new RatingRequest();
        r1.setQuestionId(questionId);
        r1.setRating(5);
        respReq.setRatings(List.of(r1));

        ResponseResponse response = responseService.submitResponse(form.getId(), respReq);
        assertNotNull(response);
    }

    @Test
    void testClosedFormLookupThrowsFeedbackClosedException() {
        CourseRequest courseReq = new CourseRequest();
        courseReq.setCourseCode("CS109");
        courseReq.setCourseName("Distributed Systems");
        courseReq.setFacultyName("Dr. Alan");
        Course course = courseService.createCourse(courseReq);

        FeedbackFormRequest formReq = new FeedbackFormRequest();
        formReq.setSemester("2026-27");
        formReq.setClosingDate(LocalDate.now().plusDays(5));
        QuestionRequest q1 = new QuestionRequest();
        q1.setQuestionText("Labs?");
        formReq.setQuestions(List.of(q1));
        FeedbackForm form = feedbackFormService.createFeedbackForm(course.getId(), formReq);

        feedbackFormService.closeFeedbackForm(form.getId());

        assertThrows(FeedbackClosedException.class, () -> {
            feedbackFormService.getFeedbackForm(form.getId());
        });
    }

    @Test
    void testNonExistentResources() {
        assertThrows(ResourceNotFoundException.class, () -> {
            courseService.getCourseById(99999L);
        });

        assertThrows(ResourceNotFoundException.class, () -> {
            analyticsService.getFormAnalytics(99999L);
        });
    }
}
