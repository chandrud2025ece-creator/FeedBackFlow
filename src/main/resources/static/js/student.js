let currentFormForStudent = null;

async function initStudentPage() {
    loadAvailableFormsForStudent();
}

async function loadAvailableFormsForStudent() {
    const select = document.getElementById('studentAvailableFormsSelect');
    const alertBox = document.getElementById('studentAlertBox');
    const formCard = document.getElementById('studentFormCard');
    if (!select) return;

    select.innerHTML = '<option value="">-- Loading available feedback forms... --</option>';

    try {
        const allForms = await Api.getFeedbackForms();
        const todayStr = new Date().toISOString().split('T')[0];

        const activeForms = (allForms || []).filter(form => {
            const isClosed = Boolean(form.closed);
            const isPastDeadline = form.closingDate && form.closingDate < todayStr;
            return !isClosed && !isPastDeadline;
        });

        if (activeForms.length === 0) {
            select.innerHTML = '<option value="">-- No Active Feedback Forms Available --</option>';
            if (formCard) formCard.style.display = 'none';
            if (alertBox) {
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = 'No active feedback forms are currently available for student submission.';
                alertBox.style.display = 'block';
            }
            return;
        }

        if (alertBox) alertBox.style.display = 'none';

        select.innerHTML = '<option value="">-- Select Active Feedback Form --</option>';
        activeForms.forEach(form => {
            const courseCode = form.course ? form.course.courseCode : '';
            const courseName = form.course ? form.course.courseName : '';
            select.innerHTML += `<option value="${form.id}">Form #${form.id} - ${escapeHtml(courseCode)}: ${escapeHtml(courseName)} (Semester: ${escapeHtml(form.semester)})</option>`;
        });

        // Automatically select first active form if available
        if (activeForms.length > 0) {
            select.value = activeForms[0].id;
            onStudentAvailableFormSelected(activeForms[0].id);
        }
    } catch (err) {
        select.innerHTML = '<option value="">-- Could not load forms --</option>';
        showToast("Error loading feedback forms: " + err.message, "error");
    }
}

function onStudentAvailableFormSelected(formId) {
    const formIdInput = document.getElementById('studentFormIdInput');
    if (formIdInput) {
        formIdInput.value = formId || '';
    }
    if (formId) {
        fetchAndRenderFormForStudent(formId);
    } else {
        const formCard = document.getElementById('studentFormCard');
        if (formCard) formCard.style.display = 'none';
    }
}

async function handleStudentFormLookup() {
    const formIdInput = document.getElementById('studentFormIdInput').value.trim();
    const alertBox = document.getElementById('studentAlertBox');
    const formCard = document.getElementById('studentFormCard');
    if (alertBox) alertBox.style.display = 'none';

    if (!formIdInput) {
        showToast("Please enter a Feedback Form ID.", "error");
        return;
    }

    fetchAndRenderFormForStudent(formIdInput);
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
    document.getElementById('studentCourseCode').textContent = `${courseCode} - ${courseName}`;
    document.getElementById('studentSemester').textContent = form.semester;

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
            statusBadge.className = 'badge badge-success';
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
        qBlock.innerHTML = `
            <div class="question-title">${idx + 1}. ${escapeHtml(qText)}</div>
            <div class="rating-options" data-question-id="${qId}">
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 1)`}">1</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 2)`}">2</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 3)`}">3</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 4)`}">4</div>
                <div class="rating-btn ${isClosed ? 'disabled' : ''}" onclick="${isClosed ? '' : `selectRating(this, ${qId}, 5)`}">5</div>
            </div>
            <div class="rating-labels">
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
