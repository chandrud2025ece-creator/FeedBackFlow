let currentFormForStudent = null;
let activeFormsForStudentList = [];

async function initStudentPage() {
    updateStudentStepProgress(1);
    loadAvailableFormsForStudent();
}

function updateStudentStepProgress(stepNum) {
    const step1 = document.getElementById('stepIndicator1');
    const step2 = document.getElementById('stepIndicator2');
    const step3 = document.getElementById('stepIndicator3');

    if (!step1 || !step2 || !step3) return;

    step1.classList.remove('active', 'completed');
    step2.classList.remove('active', 'completed');
    step3.classList.remove('active', 'completed');

    if (stepNum === 1) {
        step1.classList.add('active');
    } else if (stepNum === 2) {
        step1.classList.add('completed');
        step2.classList.add('active');
    } else if (stepNum === 3) {
        step1.classList.add('completed');
        step2.classList.add('completed');
        step3.classList.add('active');
    }
}

async function loadAvailableFormsForStudent() {
    const listContainer = document.getElementById('studentAvailableFormsList');
    const alertBox = document.getElementById('studentAlertBox');
    const formCard = document.getElementById('studentFormCard');
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">Loading available forms...</p>';

    try {
        const allForms = await Api.getFeedbackForms();
        const todayStr = new Date().toISOString().split('T')[0];

        activeFormsForStudentList = (allForms || []).filter(form => {
            const isClosed = Boolean(form.closed);
            const isPastDeadline = form.closingDate && form.closingDate < todayStr;
            return !isClosed && !isPastDeadline;
        });

        if (activeFormsForStudentList.length === 0) {
            listContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">No active feedback forms are currently available for submission.</p>';
            if (formCard) formCard.style.display = 'none';
            if (alertBox) {
                alertBox.className = 'alert alert-warning';
                alertBox.textContent = 'No active feedback forms are currently open.';
                alertBox.style.display = 'block';
            }
            return;
        }

        if (alertBox) alertBox.style.display = 'none';

        renderAvailableFormsCards();

        // Auto select first form
        if (activeFormsForStudentList.length > 0) {
            selectStudentFormCard(activeFormsForStudentList[0].id);
        }
    } catch (err) {
        listContainer.innerHTML = `<p style="color: var(--danger); text-align: center; padding: 1.5rem 0;">${escapeHtml(err.message)}</p>`;
        showToast("Error loading feedback forms: " + err.message, "error");
    }
}

function renderAvailableFormsCards() {
    const listContainer = document.getElementById('studentAvailableFormsList');
    if (!listContainer) return;

    listContainer.innerHTML = activeFormsForStudentList.map(form => {
        const courseCode = form.course ? form.course.courseCode : '';
        const courseName = form.course ? form.course.courseName : '';
        const facultyName = form.course ? form.course.facultyName : '';

        return `
            <div class="student-form-selection-card" id="studentFormCardItem_${form.id}" onclick="selectStudentFormCard(${form.id})" style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 0.65rem; cursor: pointer; transition: var(--transition);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--navy); font-size: 0.95rem;">${escapeHtml(courseCode)}: ${escapeHtml(courseName)}</strong>
                    <span class="badge badge-open">Form #${form.id}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem; display: flex; justify-content: space-between;">
                    <span>Faculty: ${escapeHtml(facultyName)}</span>
                    <span>Deadline: ${escapeHtml(form.closingDate)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function selectStudentFormCard(formId) {
    // Highlight selected card UI
    document.querySelectorAll('.student-form-selection-card').forEach(card => {
        card.style.borderColor = 'var(--border)';
        card.style.backgroundColor = 'var(--bg-card)';
    });

    const selectedCard = document.getElementById(`studentFormCardItem_${formId}`);
    if (selectedCard) {
        selectedCard.style.borderColor = 'var(--primary)';
        selectedCard.style.backgroundColor = 'var(--primary-light)';
    }

    const formIdInput = document.getElementById('studentFormIdInput');
    if (formIdInput) {
        formIdInput.value = formId || '';
    }

    if (formId) {
        updateStudentStepProgress(2);
        fetchAndRenderFormForStudent(formId);
    } else {
        updateStudentStepProgress(1);
        const formCard = document.getElementById('studentFormCard');
        if (formCard) formCard.style.display = 'none';
    }
}

async function handleStudentFormLookup() {
    const formIdInput = document.getElementById('studentFormIdInput').value.trim();
    const alertBox = document.getElementById('studentAlertBox');
    if (alertBox) alertBox.style.display = 'none';

    if (!formIdInput) {
        showToast("Please enter a Feedback Form ID.", "error");
        return;
    }

    selectStudentFormCard(formIdInput);
}

async function fetchAndRenderFormForStudent(formId) {
    const formCard = document.getElementById('studentFormCard');
    const alertBox = document.getElementById('studentAlertBox');
    if (alertBox) alertBox.style.display = 'none';

    try {
        const form = await Api.getFeedbackForm(formId);
        currentFormForStudent = form;
        renderStudentFormUI(form);
    } catch (err) {
        if (formCard) formCard.style.display = 'none';
        if (alertBox) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = err.message || "Feedback form not found.";
            alertBox.style.display = 'block';
        }
    }
}

function renderStudentFormUI(form) {
    const formCard = document.getElementById('studentFormCard');
    const alertBox = document.getElementById('studentAlertBox');
    if (!formCard) return;

    const courseCode = form.course ? form.course.courseCode : '';
    const courseName = form.course ? form.course.courseName : '';
    const facultyName = form.course ? form.course.facultyName : '';

    const courseHeaderElem = document.getElementById('studentCourseCode');
    if (courseHeaderElem) courseHeaderElem.textContent = `${courseCode} - ${courseName}`;

    const facultyElem = document.getElementById('studentFacultyName');
    if (facultyElem) facultyElem.textContent = facultyName || 'Faculty';

    const semesterElem = document.getElementById('studentSemester');
    if (semesterElem) semesterElem.textContent = form.semester || '-';

    const deadlineElem = document.getElementById('studentDeadline');
    if (deadlineElem) deadlineElem.textContent = form.closingDate || '-';

    const todayStr = new Date().toISOString().split('T')[0];
    const isPastDeadline = form.closingDate && form.closingDate < todayStr;
    const isClosed = Boolean(form.closed) || isPastDeadline;

    const statusBadge = document.getElementById('studentFormStatusBadge');
    const submitBtn = document.getElementById('submitResponseBtn');
    const studentIdInput = document.getElementById('studentIdInput');

    if (statusBadge) {
        if (isClosed) {
            statusBadge.textContent = isPastDeadline ? 'EXPIRED' : 'CLOSED';
            statusBadge.className = isPastDeadline ? 'badge badge-warning' : 'badge badge-closed';
        } else {
            statusBadge.textContent = 'OPEN';
            statusBadge.className = 'badge badge-open';
        }
    }

    if (isClosed) {
        if (alertBox) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = isPastDeadline 
                ? 'Feedback submission deadline has passed for this form.' 
                : 'Feedback submission is closed for this form.';
            alertBox.style.display = 'block';
        }
        if (studentIdInput) studentIdInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
    } else {
        if (alertBox) alertBox.style.display = 'none';
        if (studentIdInput) studentIdInput.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
    }

    const questionsContainer = document.getElementById('studentQuestionsContainer');
    questionsContainer.innerHTML = '';

    const questions = form.questions || [];
    questions.forEach((q, idx) => {
        const qId = q.id || q.questionId;
        const qText = q.questionText || q.question;

        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';
        qBlock.style.backgroundColor = '#F8FAFC';
        qBlock.style.border = '1px solid var(--border)';
        qBlock.style.borderRadius = 'var(--radius-md)';
        qBlock.style.padding = '1rem 1.25rem';
        qBlock.style.marginBottom = '1rem';

        qBlock.innerHTML = `
            <div class="question-title" style="font-size: 0.95rem; font-weight: 700; color: var(--navy); margin-bottom: 0.75rem;">
                ${idx + 1}. ${escapeHtml(qText)}
            </div>
            <div class="rating-options" data-question-id="${qId}" style="display: flex; gap: 0.5rem; justify-content: space-between; margin-bottom: 0.5rem;">
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 1)`}">1</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 2)`}">2</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 3)`}">3</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 4)`}">4</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 5)`}">5</div>
            </div>
            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                <span>1 = Poor</span>
                <span>5 = Excellent</span>
            </div>
            <input type="hidden" id="rating_q_${qId}" value="" />
        `;
        questionsContainer.appendChild(qBlock);
    });

    formCard.style.display = 'block';
}

function selectRating(btnElement, questionId, ratingValue) {
    const parent = btnElement.parentElement;
    const btns = parent.querySelectorAll('.rating-btn');
    btns.forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');

    const hiddenInput = document.getElementById(`rating_q_${questionId}`);
    if (hiddenInput) {
        hiddenInput.value = ratingValue;
    }
}

async function handleStudentFeedbackSubmit(event) {
    event.preventDefault();

    const formId = document.getElementById('studentFormIdInput').value.trim();
    const studentId = document.getElementById('studentIdInput').value.trim();
    const alertBox = document.getElementById('studentAlertBox');
    if (alertBox) alertBox.style.display = 'none';

    if (!formId) {
        showToast("Please select a feedback form.", "error");
        return;
    }

    if (!studentId) {
        showToast("Please enter your Student ID.", "error");
        return;
    }

    if (!currentFormForStudent || !currentFormForStudent.questions) {
        showToast("Form error. Please reload form.", "error");
        return;
    }

    const ratingsPayload = [];
    let allAnswered = true;

    currentFormForStudent.questions.forEach(q => {
        const qId = q.id || q.questionId;
        const inputElem = document.getElementById(`rating_q_${qId}`);
        const val = inputElem ? inputElem.value : null;
        if (!val) {
            allAnswered = false;
        } else {
            ratingsPayload.push({
                questionId: qId,
                rating: parseInt(val, 10)
            });
        }
    });

    if (!allAnswered) {
        showToast("Please provide a rating (1-5) for every question.", "error");
        return;
    }

    const btn = document.getElementById('submitResponseBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting Feedback...';

    try {
        await Api.submitFeedback(formId, {
            studentId: studentId,
            ratings: ratingsPayload
        });

        updateStudentStepProgress(3);

        if (alertBox) {
            alertBox.className = 'alert alert-success';
            alertBox.textContent = 'Feedback submitted successfully! Thank you for your responses.';
            alertBox.style.display = 'block';
        }
        showToast('Feedback submitted successfully!', 'success');

        document.getElementById('studentIdInput').value = '';
        document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('input[id^="rating_q_"]').forEach(i => i.value = '');
    } catch (err) {
        if (alertBox) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = err.message || 'Failed to submit feedback.';
            alertBox.style.display = 'block';
        }
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Feedback';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const lookupBtn = document.getElementById('lookupFormBtn');
    if (lookupBtn) {
        lookupBtn.addEventListener('click', handleStudentFormLookup);
    }

    const form = document.getElementById('studentFeedbackForm');
    if (form) {
        form.addEventListener('submit', handleStudentFeedbackSubmit);
    }
});
