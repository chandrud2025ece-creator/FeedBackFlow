async function initAnalyticsPage() {
    // Optionally auto-load or prepare lookup
}

async function handleAnalyticsLookup(event) {
    if (event) event.preventDefault();

    const formId = document.getElementById('analyticsFormIdInput').value.trim();
    const resultCard = document.getElementById('analyticsResultCard');
    const alertBox = document.getElementById('analyticsAlertBox');
    alertBox.style.display = 'none';

    if (!formId) {
        showToast("Please enter a Feedback Form ID.", "error");
        return;
    }

    try {
        const analytics = await Api.getAnalytics(formId);
        renderAnalyticsResult(analytics);
    } catch (err) {
        resultCard.style.display = 'none';
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = err.message || "Could not retrieve analytics.";
        alertBox.style.display = 'block';
        showToast(err.message, "error");
    }
}

function renderAnalyticsResult(analytics) {
    const resultCard = document.getElementById('analyticsResultCard');
    if (!resultCard) return;

    document.getElementById('analyticsCourseHeader').textContent = `${analytics.courseCode} - ${analytics.courseName}`;
    document.getElementById('analyticsSemester').textContent = analytics.semester;
    document.getElementById('analyticsFormId').textContent = analytics.formId;

    const overallScore = analytics.overallAverage ? analytics.overallAverage.toFixed(2) : '0.00';
    document.getElementById('analyticsOverallScore').textContent = `${overallScore} / 5.0`;

    const container = document.getElementById('questionAnalyticsList');
    container.innerHTML = '';

    if (!analytics.questions || analytics.questions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No question analytics available for this form.</p>';
    } else {
        analytics.questions.forEach(q => {
            const avg = q.averageRating ? q.averageRating.toFixed(2) : '0.00';
            const percentage = Math.min(Math.max((q.averageRating / 5.0) * 100, 0), 100);

            const div = document.createElement('div');
            div.className = 'analytics-item';
            div.innerHTML = `
                <div class="analytics-meta">
                    <span>${escapeHtml(q.question)}</span>
                    <span style="color: var(--primary); font-weight: 700;">${avg} / 5.0</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${percentage}%;"></div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    resultCard.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analyticsLookupForm');
    if (form) {
        form.addEventListener('submit', handleAnalyticsLookup);
    }
});
