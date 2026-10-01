async function initFacultyPage() {
    // Ready for user search
}

async function handleFacultySearchSubmit(event) {
    if (event) event.preventDefault();

    const inputElem = document.getElementById('facultyNameSearchInput');
    const facultyNameInput = inputElem ? inputElem.value.trim() : '';

    const resultCard = document.getElementById('facultyResultCard');
    const alertBox = document.getElementById('facultyAlertBox');
    if (alertBox) alertBox.style.display = 'none';

    if (!facultyNameInput) {
        if (resultCard) resultCard.style.display = 'none';
        showToast("Please enter a faculty name.", "error");
        return;
    }

    try {
        const summary = await Api.getFacultySummary(facultyNameInput);
        renderFacultySummaryResult(summary);
    } catch (err) {
        if (resultCard) resultCard.style.display = 'none';
        if (alertBox) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = err.message || "Failed to load faculty summary.";
            alertBox.style.display = 'block';
        }
        showToast(err.message, "error");
    }
}

function renderFacultySummaryResult(summary) {
    const resultCard = document.getElementById('facultyResultCard');
    if (!resultCard) return;

    const nameElem = document.getElementById('facultyDisplayName');
    if (nameElem) nameElem.textContent = summary.facultyName || 'Faculty Member';

    const courses = summary.courses || [];
    
    const coursesCountElem = document.getElementById('facultyTotalCourses');
    if (coursesCountElem) coursesCountElem.textContent = courses.length;

    let totalForms = 0;
    let totalResponses = 0;
    courses.forEach(c => {
        if (typeof c.totalForms === 'number') totalForms += c.totalForms;
        if (typeof c.totalResponses === 'number') totalResponses += c.totalResponses;
    });

    const formsCountElem = document.getElementById('facultyTotalForms');
    if (formsCountElem) formsCountElem.textContent = totalForms || courses.length;

    const responsesCountElem = document.getElementById('facultyTotalResponses');
    if (responsesCountElem) responsesCountElem.textContent = totalResponses;

    const tableBody = document.getElementById('facultyCoursesTableBody');
    if (tableBody) {
        if (courses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 1.5rem 0;">No feedback summary found for this faculty member.</td></tr>';
        } else {
            tableBody.innerHTML = courses.map(c => {
                const avgNum = (typeof c.overallAverage === 'number') ? c.overallAverage : 0;
                const avgStr = avgNum.toFixed(2);
                return `
                    <tr>
                        <td><strong style="color: var(--navy);">${escapeHtml(c.courseCode)}</strong></td>
                        <td>${escapeHtml(c.courseName)}</td>
                        <td>${escapeHtml(c.semester)}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="font-weight: 800; color: var(--primary); font-size: 1.05rem;">
                                    ${avgStr} / 5.0
                                </span>
                                ${renderStarRating(avgNum)}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    resultCard.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('facultySearchForm');
    if (form) {
        form.addEventListener('submit', handleFacultySearchSubmit);
    }
});
