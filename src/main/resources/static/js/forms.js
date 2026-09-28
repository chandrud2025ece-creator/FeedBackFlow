let questionCounter = 0;

async function initFormsPage() {
    loadCoursesForFormSelect();
    resetFormCreationCard();
    loadAllFeedbackForms();
}

async function loadCoursesForFormSelect() {
    const select = document.getElementById('formCourseSelect');
    if (!select) return;

    try {
        const courses = await Api.getCourses();
        select.innerHTML = '<option value="">-- Select Course --</option>';
        courses.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${escapeHtml(c.courseCode)} - ${escapeHtml(c.courseName)} (${escapeHtml(c.facultyName)})</option>`;
        });
    } catch (err) {
        showToast("Could not load courses list: " + err.message, "error");
    }
}

async function loadAllFeedbackForms() {
    const tableBody = document.getElementById('publishedFormsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading forms...</td></tr>';

    try {
        const forms = await Api.getFeedbackForms();
        if (!forms || forms.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No feedback forms published yet.</td></tr>';
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        tableBody.innerHTML = forms.map(form => {
            let statusText = 'OPEN';
            let badgeClass = 'badge-success';

            const isPastDeadline = form.closingDate && form.closingDate < todayStr;
            if (form.closed) {
                statusText = 'CLOSED';
                badgeClass = 'badge-closed';
            } else if (isPastDeadline) {
                statusText = 'EXPIRED';
                badgeClass = 'badge-warning';
            }

            const courseCode = form.course ? form.course.courseCode : '';
            const courseName = form.course ? form.course.courseName : '';
            const facultyName = form.course ? form.course.facultyName : '';

            const actionBtn = (statusText === 'OPEN') 
                ? `<button type="button" class="btn btn-danger btn-sm" onclick="closeFormAction(${form.id})">Close Feedback</button>`
                : `<span style="color: var(--text-muted); font-size: 0.8rem;">${statusText}</span>`;

            return `
                <tr>
                    <td><strong>#${escapeHtml(form.id)}</strong></td>
                    <td>${escapeHtml(courseCode)} - ${escapeHtml(courseName)}</td>
                    <td>${escapeHtml(form.semester)}</td>
                    <td>${escapeHtml(form.closingDate)}</td>
                    <td><span class="badge ${badgeClass}">${statusText}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--danger);">${escapeHtml(err.message)}</td></tr>`;
    }
}

function resetFormCreationCard() {
    questionCounter = 0;
    const container = document.getElementById('questionInputsContainer');
    if (container) {
        container.innerHTML = '';
        addQuestionInput("The teaching was clear and understandable");
        addQuestionInput("The course content was relevant and useful");
        addQuestionInput("The study materials were helpful");
    }
    const resultCard = document.getElementById('createdFormResultCard');
    if (resultCard) {
        resultCard.style.display = 'none';
    }
}

function addQuestionInput(defaultText = '') {
    questionCounter++;
    const container = document.getElementById('questionInputsContainer');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'form-group question-input-row';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <input type="text" class="question-text-field" placeholder="Question ${questionCounter} text" value="${escapeHtml(defaultText)}" required />
        <button type="button" class="btn btn-secondary btn-sm remove-question-btn" onclick="this.parentElement.remove()" title="Remove Question">&times;</button>
    `;

    container.appendChild(div);
}

async function handleCreateFormSubmit(event) {
    event.preventDefault();

    const courseId = document.getElementById('formCourseSelect').value;
    const semester = document.getElementById('semesterInput').value.trim();
    const closingDate = document.getElementById('closingDateInput').value;

    if (!courseId) {
        showToast("Please select a course.", "error");
        return;
    }
    if (!semester || !closingDate) {
        showToast("Please fill in semester and closing date.", "error");
        return;
    }

    const questionFields = document.querySelectorAll('.question-text-field');
    const questions = [];
    questionFields.forEach(field => {
        const txt = field.value.trim();
        if (txt) {
            questions.push({ questionText: txt });
        }
    });

    if (questions.length === 0) {
        showToast("Please add at least one question.", "error");
        return;
    }

    const btn = document.getElementById('submitFormBtn');
    btn.disabled = true;
    btn.textContent = 'Publishing Form...';

    try {
        const createdForm = await Api.createFeedbackForm(courseId, {
            semester: semester,
            closingDate: closingDate,
            questions: questions
        });

        showToast("Feedback form created and published successfully!", "success");
        renderCreatedFormResult(createdForm);
        loadAllFeedbackForms();
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Publish Feedback Form';
    }
}

function renderCreatedFormResult(form) {
    const resultCard = document.getElementById('createdFormResultCard');
    if (!resultCard) return;

    const isClosed = form.closed;
    const statusBadge = isClosed 
        ? '<span class="badge badge-closed">CLOSED</span>' 
        : '<span class="badge badge-success">OPEN</span>';

    const closeBtnHtml = !isClosed ? `
        <button type="button" class="btn btn-danger btn-sm" onclick="closeFormAction(${form.id})">Close Feedback Collection</button>
    ` : '<span style="color: var(--text-muted); font-size: 0.85rem;">Form is permanently closed.</span>';

    const questionsListHtml = (form.questions || []).map(q => `
        <li>${escapeHtml(q.questionText)}</li>
    `).join('');

    resultCard.innerHTML = `
        <div class="card-title">
            <span>Feedback Form Published (Form ID: #${form.id})</span>
            ${statusBadge}
        </div>
        <p><strong>Course:</strong> ${escapeHtml(form.course ? form.course.courseCode : '')} - ${escapeHtml(form.course ? form.course.courseName : '')}</p>
        <p><strong>Semester:</strong> ${escapeHtml(form.semester)}</p>
        <p><strong>Closing Date:</strong> ${escapeHtml(form.closingDate)}</p>
        <div style="margin-top: 1rem;">
            <strong>Rating Questions (${(form.questions || []).length}):</strong>
            <ol style="margin-left: 1.25rem; margin-top: 0.5rem; color: var(--text-main);">
                ${questionsListHtml}
            </ol>
        </div>
        <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.85rem; color: var(--text-muted);">Form ID: #${form.id}</span>
            ${closeBtnHtml}
        </div>
    `;

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

async function closeFormAction(formId) {
    if (!confirm("Are you sure you want to close feedback collection for this form? Students will no longer be able to submit responses.")) {
        return;
    }

    try {
        const updatedForm = await Api.closeFeedbackForm(formId);
        showToast("Feedback collection closed successfully.", "success");
        renderCreatedFormResult(updatedForm);
        loadAllFeedbackForms();
    } catch (err) {
        showToast(err.message, "error");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addQBtn = document.getElementById('addQuestionBtn');
    if (addQBtn) {
        addQBtn.addEventListener('click', () => addQuestionInput(''));
    }

    const form = document.getElementById('createFeedbackFormElement');
    if (form) {
        form.addEventListener('submit', handleCreateFormSubmit);
    }
});

