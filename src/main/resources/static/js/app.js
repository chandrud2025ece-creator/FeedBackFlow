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

function navigateTo(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

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
        const courses = await Api.getCourses();
        document.getElementById('statTotalCourses').textContent = courses.length;

        const tableBody = document.getElementById('dashboardCoursesTable');
        if (tableBody) {
            if (courses.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color: var(--text-muted);">No courses created yet.</td></tr>';
            } else {
                tableBody.innerHTML = courses.slice(0, 5).map(c => `
                    <tr>
                        <td><strong>${escapeHtml(c.courseCode)}</strong></td>
                        <td>${escapeHtml(c.courseName)}</td>
                        <td>${escapeHtml(c.facultyName)}</td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Dashboard load failed:', err);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
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
