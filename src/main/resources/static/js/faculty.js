async function initFacultyPage() {
    // Ready for input
}

async function handleFacultySearchSubmit(event) {
    if (event) event.preventDefault();

    const facultyNameInput = document.getElementById('facultyNameSearchInput').value.trim();
    const resultCard = document.getElementById('facultyResultCard');
    const alertBox = document.getElementById('facultyAlertBox');
    alertBox.style.display = 'none';

    if (!facultyNameInput) {
        showToast("Please enter a faculty name.", "error");
        return;
    }

    try {
        const summary = await Api.getFacultySummary(facultyNameInput);
        renderFacultySummaryResult(summary);
    } catch (err) {
        resultCard.style.display = 'none';
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = err.message || "Failed to load faculty summary.";
        alertBox.style.display = 'block';
        showToast(err.message, "error");
    }
}

function renderFacultySummaryResult(summary) {
    const resultCard = document.getElementById('facultyResultCard');
    if (!resultCard) return;

    document.getElementById('facultyDisplayName').textContent = summary.facultyName || 'Faculty Member';
    const tableBody = document.getElementById('facultyCoursesTableBody');

    if (!summary.courses || summary.courses.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No feedback summary found for this faculty member.</td></tr>';
    } else {
        tableBody.innerHTML = summary.courses.map(c => `
            <tr>
                <td><strong>${escapeHtml(c.courseCode)}</strong></td>
                <td>${escapeHtml(c.courseName)}</td>
                <td>${escapeHtml(c.semester)}</td>
                <td>
                    <span style="font-weight: 700; color: var(--primary); font-size: 1.05rem;">
                        ${c.overallAverage ? c.overallAverage.toFixed(2) : '0.00'} / 5.0
                    </span>
                </td>
            </tr>
        `).join('');
    }

    resultCard.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('facultySearchForm');
    if (form) {
        form.addEventListener('submit', handleFacultySearchSubmit);
    }
});
