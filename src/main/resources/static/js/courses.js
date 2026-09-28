async function loadCoursesPage() {
    const tableBody = document.getElementById('coursesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading courses...</td></tr>';

    try {
        const courses = await Api.getCourses();
        if (!courses || courses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No courses found. Click "+ Create Course" to add one.</td></tr>';
            return;
        }

        tableBody.innerHTML = courses.map(course => `
            <tr>
                <td>${escapeHtml(course.id)}</td>
                <td><strong>${escapeHtml(course.courseCode)}</strong></td>
                <td>${escapeHtml(course.courseName)}</td>
                <td>${escapeHtml(course.facultyName)}</td>
                <td>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openEditCourseModal(${course.id}, '${escapeJsString(course.courseCode)}', '${escapeJsString(course.courseName)}', '${escapeJsString(course.facultyName)}')">Edit</button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteCourseAction(${course.id}, '${escapeJsString(course.courseCode)}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--danger);">${escapeHtml(err.message)}</td></tr>`;
        showToast(err.message, 'error');
    }
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

async function deleteCourseAction(id, code) {
    if (!confirm(`Are you sure you want to delete course "${code}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await Api.deleteCourse(id);
        showToast(`Course "${code}" deleted successfully.`, 'success');
        loadCoursesPage();
    } catch (err) {
        showToast(err.message, 'error');
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
});
