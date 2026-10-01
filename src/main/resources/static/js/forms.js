let questionCounter = 0;
let allPublishedFormsData = [];
let currentPublishedFormsFilter = 'ALL';

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
    const container = document.getElementById('publishedFormsListContainer');
    if (!container) return;

    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">Loading published forms...</p>';

    try {
        allPublishedFormsData = await Api.getFeedbackForms();
        renderPublishedFormsList();
    } catch (err) {
        container.innerHTML = `<p style="color: var(--danger); text-align: center; padding: 1.5rem 0;">${escapeHtml(err.message)}</p>`;
    }
}

function filterPublishedFormsList(filterValue) {
    currentPublishedFormsFilter = filterValue;
    renderPublishedFormsList();
}

function renderPublishedFormsList() {
    const container = document.getElementById('publishedFormsListContainer');
    if (!container) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = (allPublishedFormsData || []).filter(form => {
        const isClosed = Boolean(form.closed);
        const isPastDeadline = form.closingDate && form.closingDate < todayStr;
        let status = 'OPEN';
        if (isClosed) status = 'CLOSED';
        else if (isPastDeadline) status = 'EXPIRED';

        if (currentPublishedFormsFilter === 'ALL') return true;
        return status === currentPublishedFormsFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">
            ${allPublishedFormsData.length === 0 ? 'No feedback forms published yet.' : 'No forms match the selected filter.'}
        </p>`;
        return;
    }

    container.innerHTML = filtered.map(form => {
        const isClosed = Boolean(form.closed);
        const isPastDeadline = form.closingDate && form.closingDate < todayStr;

        let statusText = 'OPEN';
        let badgeClass = 'badge-open';

        if (isClosed) {
            statusText = 'CLOSED';
            badgeClass = 'badge-closed';
        } else if (isPastDeadline) {
            statusText = 'EXPIRED';
            badgeClass = 'badge-warning';
        }

        const courseCode = form.course ? form.course.courseCode : '';
        const courseName = form.course ? form.course.courseName : '';
        const facultyName = form.course ? form.course.facultyName : '';

        const closeBtn = (statusText === 'OPEN') 
            ? `<button type="button" class="btn btn-danger btn-sm" onclick="closeFormAction(${form.id})">Close Feedback</button>`
            : `<span style="font-size: 0.8rem; color: var(--text-muted);">${statusText}</span>`;

        return `
            <div style="background-color: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 0.75rem; transition: var(--transition);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <div>
                        <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">Form #${escapeHtml(form.id)}</div>
                        <h4 style="font-size: 1rem; font-weight: 700; color: var(--navy); margin: 0.1rem 0;">${escapeHtml(courseCode)}: ${escapeHtml(courseName)}</h4>
                    </div>
                    <span class="badge ${badgeClass}">${statusText}</span>
                </div>
                <div style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 1rem;">
                    <span>Faculty: <strong style="color: var(--navy);">${escapeHtml(facultyName)}</strong></span>
                    <span>Semester: <strong style="color: var(--navy);">${escapeHtml(form.semester)}</strong></span>
                    <span>Deadline: <strong style="color: var(--navy);">${escapeHtml(form.closingDate)}</strong></span>
                    <span>Questions: <strong style="color: var(--navy);">${(form.questions || []).length}</strong></span>
                </div>
                <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-light); padding-top: 0.5rem;">
                    ${closeBtn}
                </div>
            </div>
        `;
    }).join('');
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
    div.style.marginBottom = '0.5rem';

    div.innerHTML = `
        <input type="text" class="question-text-field" placeholder="Question ${questionCounter} text" value="${escapeHtml(defaultText)}" required style="flex: 1;" />
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
        : '<span class="badge badge-open">OPEN</span>';

    const closeBtnHtml = !isClosed ? `
        <button type="button" class="btn btn-danger btn-sm" onclick="closeFormAction(${form.id})">Close Feedback Collection</button>
    ` : '<span style="color: var(--text-muted); font-size: 0.85rem;">Form is permanently closed.</span>';

    const questionsListHtml = (form.questions || []).map(q => `
        <li style="margin-bottom: 0.25rem;">${escapeHtml(q.questionText)}</li>
    `).join('');

    resultCard.innerHTML = `
        <div style="background-color: var(--primary-light); border: 1px solid var(--primary); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-weight: 700; color: var(--navy); font-size: 1rem;">Published Form ID: #${form.id}</span>
                ${statusBadge}
            </div>
            <p style="margin-bottom: 0.25rem; font-size: 0.9rem;"><strong>Course:</strong> ${escapeHtml(form.course ? form.course.courseCode : '')} - ${escapeHtml(form.course ? form.course.courseName : '')}</p>
            <p style="margin-bottom: 0.25rem; font-size: 0.9rem;"><strong>Semester:</strong> ${escapeHtml(form.semester)}</p>
            <p style="margin-bottom: 0.5rem; font-size: 0.9rem;"><strong>Closing Date:</strong> ${escapeHtml(form.closingDate)}</p>
            <div style="margin-top: 0.75rem;">
                <strong style="font-size: 0.85rem; color: var(--navy);">Questions (${(form.questions || []).length}):</strong>
                <ol style="margin-left: 1.25rem; margin-top: 0.35rem; color: var(--text-main); font-size: 0.875rem;">
                    ${questionsListHtml}
                </ol>
            </div>
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--text-muted);">Form ID: #${form.id}</span>
                ${closeBtnHtml}
            </div>
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
        if (document.getElementById('createdFormResultCard').style.display !== 'none') {
            renderCreatedFormResult(updatedForm);
        }
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
