function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderStarRating(rating) {
    const numRating = parseFloat(rating) || 0;
    const rounded = Math.round(numRating * 2) / 2; // Round to nearest 0.5
    let starsHtml = '<div class="star-rating">';
    for (let i = 1; i <= 5; i++) {
        if (numRating >= i) {
            starsHtml += '<i class="fas fa-star filled">★</i>';
        } else if (numRating >= i - 0.5) {
            starsHtml += '<i class="fas fa-star filled" style="opacity:0.6;">★</i>';
        } else {
            starsHtml += '<i class="far fa-star">☆</i>';
        }
    }
    starsHtml += '</div>';
    return starsHtml;
}

function navigateTo(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Sidebar Links
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
    sidebarLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Top Header Links
    const headerLinks = document.querySelectorAll('.header-top-link');
    headerLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Page-specific initialization
    if (pageId === 'dashboardPage') {
        loadDashboard();
    } else if (pageId === 'coursesPage') {
        loadCoursesPage();
    } else if (pageId === 'formsPage') {
        initFormsPage();
    } else if (pageId === 'studentPage') {
        initStudentPage();
    } else if (pageId === 'analyticsPage') {
        initAnalyticsPage();
    } else if (pageId === 'facultyPage') {
        initFacultyPage();
    }
}

async function loadDashboard() {
    try {
        // Fetch courses and forms in parallel
        const [courses, forms] = await Promise.all([
            Api.getCourses().catch(() => []),
            Api.getFeedbackForms().catch(() => [])
        ]);

        const statTotalCourses = document.getElementById('statTotalCourses');
        if (statTotalCourses) statTotalCourses.textContent = courses.length;

        const todayStr = new Date().toISOString().split('T')[0];
        let activeCount = 0;
        let closedCount = 0;

        forms.forEach(form => {
            const isClosed = Boolean(form.closed);
            const isPastDeadline = form.closingDate && form.closingDate < todayStr;
            if (!isClosed && !isPastDeadline) {
                activeCount++;
            } else {
                closedCount++;
            }
        });

        const statActiveForms = document.getElementById('statActiveForms');
        if (statActiveForms) statActiveForms.textContent = activeCount;

        const statClosedForms = document.getElementById('statClosedForms');
        if (statClosedForms) statClosedForms.textContent = closedCount;

        // Fetch analytics for active forms to count total responses
        let totalResponses = 0;
        const analyticsPromises = forms.map(f => Api.getAnalytics(f.id).catch(() => null));
        const analyticsList = await Promise.all(analyticsPromises);

        analyticsList.forEach(a => {
            if (a && typeof a.totalResponses === 'number') {
                totalResponses += a.totalResponses;
            }
        });

        const statTotalResponses = document.getElementById('statTotalResponses');
        if (statTotalResponses) statTotalResponses.textContent = totalResponses;

        // Populate Dashboard Active Forms Table
        const tableBody = document.getElementById('dashboardActiveFormsTable');
        if (tableBody) {
            const activeFormsList = forms.filter(form => {
                const isClosed = Boolean(form.closed);
                const isPastDeadline = form.closingDate && form.closingDate < todayStr;
                return !isClosed && !isPastDeadline;
            });

            if (activeFormsList.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 1.5rem 0;">No active feedback forms currently open.</td></tr>';
            } else {
                tableBody.innerHTML = activeFormsList.slice(0, 5).map(form => {
                    const courseCode = form.course ? form.course.courseCode : '';
                    const courseName = form.course ? form.course.courseName : '';
                    return `
                        <tr>
                            <td><strong>#${escapeHtml(form.id)}</strong></td>
                            <td>${escapeHtml(courseCode)} - ${escapeHtml(courseName)}</td>
                            <td>${escapeHtml(form.semester)}</td>
                            <td>${escapeHtml(form.closingDate)}</td>
                            <td><span class="badge badge-open">OPEN</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Dashboard load failed:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Navigation listeners for sidebar and top header
    const navLinks = document.querySelectorAll('.sidebar-nav-link, .header-top-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            if (pageId) {
                navigateTo(pageId);
            }
        });
    });

    navigateTo('dashboardPage');
});
