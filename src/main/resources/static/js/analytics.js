async function initAnalyticsPage() {
    await loadFormsForAnalyticsSelect();
}

async function loadFormsForAnalyticsSelect() {
    const select = document.getElementById('analyticsFormSelect');
    if (!select) return;

    try {
        const forms = await Api.getFeedbackForms();
        if (!forms || forms.length === 0) {
            select.innerHTML = '<option value="">-- No Feedback Forms Available --</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Select Feedback Form --</option>';
        forms.forEach(f => {
            const courseCode = f.course ? f.course.courseCode : '';
            const courseName = f.course ? f.course.courseName : '';
            select.innerHTML += `<option value="${f.id}">Form #${f.id} - ${escapeHtml(courseCode)}: ${escapeHtml(courseName)} (${escapeHtml(f.semester)})</option>`;
        });

        // Auto select first form if available
        if (forms.length > 0) {
            select.value = forms[0].id;
            handleAnalyticsLookup();
        }
    } catch (err) {
        select.innerHTML = '<option value="">-- Could not load forms --</option>';
        showToast("Error loading forms: " + err.message, "error");
    }
}

async function handleAnalyticsLookup(event) {
    if (event) event.preventDefault();

    const select = document.getElementById('analyticsFormSelect');
    const formId = select ? select.value : '';

    const resultCard = document.getElementById('analyticsResultCard');
    const alertBox = document.getElementById('analyticsAlertBox');
    if (alertBox) alertBox.style.display = 'none';

    if (!formId) {
        if (resultCard) resultCard.style.display = 'none';
        showToast("Please select a Feedback Form.", "error");
        return;
    }

    try {
        const analytics = await Api.getAnalytics(formId);
        renderAnalyticsResult(analytics);
    } catch (err) {
        if (resultCard) resultCard.style.display = 'none';
        if (alertBox) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = err.message || "Could not retrieve analytics.";
            alertBox.style.display = 'block';
        }
        showToast(err.message, "error");
    }
}

function renderAnalyticsResult(analytics) {
    const resultCard = document.getElementById('analyticsResultCard');
    if (!resultCard) return;

    const courseCodeElem = document.getElementById('analyticsCourseCode');
    if (courseCodeElem) courseCodeElem.textContent = analytics.courseCode || '-';

    const courseNameElem = document.getElementById('analyticsCourseName');
    if (courseNameElem) courseNameElem.textContent = analytics.courseName || '-';

    const facultyElem = document.getElementById('analyticsFaculty');
    if (facultyElem) facultyElem.textContent = analytics.facultyName || '-';

    const semesterElem = document.getElementById('analyticsSemester');
    if (semesterElem) semesterElem.textContent = analytics.semester || '-';

    const totalRespElem = document.getElementById('analyticsTotalResponses');
    if (totalRespElem) totalRespElem.textContent = analytics.totalResponses || 0;

    const overallScore = (typeof analytics.overallAverage === 'number') ? analytics.overallAverage.toFixed(2) : '0.00';
    const scoreDisplay = document.getElementById('analyticsOverallScore');
    if (scoreDisplay) scoreDisplay.textContent = `${overallScore} / 5.0`;

    const starsRow = document.getElementById('analyticsStarsRow');
    if (starsRow) starsRow.innerHTML = renderStarRating(overallScore);

    const countDisplay = document.getElementById('analyticsResponseCount');
    if (countDisplay) countDisplay.textContent = `Based on ${analytics.totalResponses || 0} responses`;

    const container = document.getElementById('questionAnalyticsList');
    if (container) {
        container.innerHTML = '';

        if (!analytics.questions || analytics.questions.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem 0;">No question analytics available for this form.</p>';
        } else {
            analytics.questions.forEach((q, idx) => {
                const avg = (typeof q.averageRating === 'number') ? q.averageRating.toFixed(2) : '0.00';
                const percentage = Math.min(Math.max((q.averageRating / 5.0) * 100, 0), 100);

                const div = document.createElement('div');
                div.className = 'analytics-item';
                div.style.backgroundColor = '#F8FAFC';
                div.style.border = '1px solid var(--border)';
                div.style.borderRadius = 'var(--radius-md)';
                div.style.padding = '1rem 1.25rem';
                div.style.marginBottom = '0.75rem';

                div.innerHTML = `
                    <div class="analytics-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: var(--navy); font-size: 0.9rem;">${idx + 1}. ${escapeHtml(q.question)}</span>
                        <span style="color: var(--primary); font-weight: 800; font-size: 1rem;">${avg} / 5.0</span>
                    </div>
                    <div class="progress-track" style="height: 8px; background-color: var(--border-light); border-radius: 4px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-hover)); border-radius: 4px; transition: width 0.4s ease;"></div>
                    </div>
                `;
                container.appendChild(div);
            });
        }
    }

    resultCard.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analyticsLookupForm');
    if (form) {
        form.addEventListener('submit', handleAnalyticsLookup);
    }
    const select = document.getElementById('analyticsFormSelect');
    if (select) {
        select.addEventListener('change', handleAnalyticsLookup);
    }
});
