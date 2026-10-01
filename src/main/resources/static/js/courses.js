let allCoursesData = [];
let courseSearchQuery = '';
let currentCoursePage = 1;
const COURSES_PER_PAGE = 5;

async function loadCoursesPage() {
    const tableBody = document.getElementById('coursesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem 0;">Loading courses...</td></tr>';

    try {
        allCoursesData = await Api.getCourses();
        renderFilteredCourses();
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--danger); padding: 1.5rem 0;">${escapeHtml(err.message)}</td></tr>`;
        showToast(err.message, 'error');
    }
}

function renderFilteredCourses() {
    const tableBody = document.getElementById('coursesTableBody');
    const paginationContainer = document.getElementById('coursesPagination');
    if (!tableBody) return;

    const query = courseSearchQuery.trim().toLowerCase();
    const filtered = allCoursesData.filter(course => {
        if (!query) return true;
        const code = (course.courseCode || '').toLowerCase();
        const name = (course.courseName || '').toLowerCase();
        const faculty = (course.facultyName || '').toLowerCase();
        const idStr = String(course.id || '');
        return code.includes(query) || name.includes(query) || faculty.includes(query) || idStr.includes(query);
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 2rem 0;">
            ${allCoursesData.length === 0 ? 'No courses found. Click "+ Add Course" to create one.' : 'No matching courses found.'}
        </td></tr>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Pagination math
    const totalPages = Math.ceil(filtered.length / COURSES_PER_PAGE);
    if (currentCoursePage > totalPages) currentCoursePage = totalPages;
    if (currentCoursePage < 1) currentCoursePage = 1;

    const startIndex = (currentCoursePage - 1) * COURSES_PER_PAGE;
    const pageItems = filtered.slice(startIndex, startIndex + COURSES_PER_PAGE);

    tableBody.innerHTML = pageItems.map(course => `
        <tr>
            <td>${escapeHtml(course.id)}</td>
            <td><strong style="color: var(--navy); font-weight: 700;">${escapeHtml(course.courseCode)}</strong></td>
            <td>${escapeHtml(course.courseName)}</td>
            <td>${escapeHtml(course.facultyName)}</td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openEditCourseModal(${course.id}, '${escapeJsString(course.courseCode)}', '${escapeJsString(course.courseName)}', '${escapeJsString(course.facultyName)}')" title="Edit Course">
                        Edit
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteCourseAction(${course.id}, '${escapeJsString(course.courseCode)}', this)" title="Delete Course">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Render Pagination Controls
    if (paginationContainer) {
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
        } else {
            let paginationHtml = '';
            paginationHtml += `<button type="button" class="btn btn-secondary btn-sm" ${currentCoursePage === 1 ? 'disabled' : ''} onclick="changeCoursePage(${currentCoursePage - 1})">&laquo;</button>`;
            for (let p = 1; p <= totalPages; p++) {
                paginationHtml += `<button type="button" class="btn ${p === currentCoursePage ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="changeCoursePage(${p})">${p}</button>`;
            }
            paginationHtml += `<button type="button" class="btn btn-secondary btn-sm" ${currentCoursePage === totalPages ? 'disabled' : ''} onclick="changeCoursePage(${currentCoursePage + 1})">&raquo;</button>`;
            paginationContainer.innerHTML = paginationHtml;
        }
    }
}

function changeCoursePage(page) {
    currentCoursePage = page;
    renderFilteredCourses();
}

function escapeJsString(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function openCreateCourseModal() {
    const modal = document.getElementById('createCourseModal');
    if (modal) {
        document.getElementById('createCourseForm').reset();
        modal.classList.add('active');
    }
}

function closeCreateCourseModal() {
    const modal = document.getElementById('createCourseModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function openEditCourseModal(id, code, name, faculty) {
    const modal = document.getElementById('editCourseModal');
    if (!modal) return;
    document.getElementById('editCourseIdInput').value = id;
    document.getElementById('editCourseCodeInput').value = code;
    document.getElementById('editCourseNameInput').value = name;
    document.getElementById('editFacultyNameInput').value = faculty;
    modal.classList.add('active');
}

function closeEditCourseModal() {
    const modal = document.getElementById('editCourseModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function handleCreateCourseSubmit(event) {
    event.preventDefault();

    const courseCode = document.getElementById('courseCodeInput').value.trim();
    const courseName = document.getElementById('courseNameInput').value.trim();
    const facultyName = document.getElementById('facultyNameInput').value.trim();

    if (!courseCode || !courseName || !facultyName) {
        showToast('Please fill in all required course fields.', 'error');
        return;
    }

    const btn = document.getElementById('submitCourseBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const newCourse = await Api.createCourse({
            courseCode: courseCode,
            courseName: courseName,
            facultyName: facultyName
        });

        showToast(`Course "${newCourse.courseCode}" created successfully!`, 'success');
        closeCreateCourseModal();
        loadCoursesPage();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Course';
    }
}

async function handleEditCourseSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('editCourseIdInput').value;
    const courseCode = document.getElementById('editCourseCodeInput').value.trim();
    const courseName = document.getElementById('editCourseNameInput').value.trim();
    const facultyName = document.getElementById('editFacultyNameInput').value.trim();

    if (!id || !courseCode || !courseName || !facultyName) {
        showToast('Please fill in all required course fields.', 'error');
        return;
    }

    const btn = document.getElementById('submitEditCourseBtn');
    btn.disabled = true;
    btn.textContent = 'Updating...';

    try {
        const updatedCourse = await Api.updateCourse(id, {
            courseCode: courseCode,
            courseName: courseName,
            facultyName: facultyName
        });

        showToast(`Course "${updatedCourse.courseCode}" updated successfully!`, 'success');
        closeEditCourseModal();
        loadCoursesPage();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Update Course';
    }
}

async function deleteCourseAction(id, code, btnElement) {
    if (!confirm(`Are you sure you want to delete course "${code}"?`)) {
        return;
    }

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.textContent = 'Deleting...';
    }

    try {
        await Api.deleteCourse(id);
        showToast(`Course "${code}" deleted successfully!`, 'success');
        loadCoursesPage();
    } catch (err) {
        showToast(err.message || 'Could not delete course.', 'error');
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.textContent = 'Delete';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openCourseModalBtn');
    if (openBtn) {
        openBtn.addEventListener('click', openCreateCourseModal);
    }

    const closeBtn = document.getElementById('closeCourseModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCreateCourseModal);
    }

    const createForm = document.getElementById('createCourseForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateCourseSubmit);
    }

    const editForm = document.getElementById('editCourseForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditCourseSubmit);
    }

    const searchInput = document.getElementById('courseSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            courseSearchQuery = e.target.value;
            currentCoursePage = 1;
            renderFilteredCourses();
        });
    }
});
