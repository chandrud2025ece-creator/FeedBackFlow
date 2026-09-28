const API_BASE_URL = "http://localhost:8080";

async function apiRequest(endpoint, method = "GET", data = null) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const contentType = response.headers.get("content-type");
        let resultData = null;

        if (contentType && contentType.includes("application/json")) {
            resultData = await response.json();
        } else {
            resultData = await response.text();
        }

        if (!response.ok) {
            const errorMessage = (resultData && resultData.message) ? resultData.message : "Request failed with status " + response.status;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = resultData;
            throw error;
        }

        return resultData;
    } catch (err) {
        if (!err.status) {
            err.message = "Unable to connect to the server. Please make sure Spring Boot is running.";
        }
        throw err;
    }
}

const Api = {
    getCourses: () => apiRequest("/api/courses", "GET"),
    getCourseById: (id) => apiRequest(`/api/courses/${id}`, "GET"),
    createCourse: (courseData) => apiRequest("/api/courses", "POST", courseData),
    updateCourse: (id, courseData) => apiRequest(`/api/courses/${id}`, "PUT", courseData),
    deleteCourse: (id) => apiRequest(`/api/courses/${id}`, "DELETE"),
    getFeedbackForms: () => apiRequest("/api/forms", "GET"),
    createFeedbackForm: (courseId, formData) => apiRequest(`/api/courses/${courseId}/forms`, "POST", formData),
    getFeedbackForm: (formId) => apiRequest(`/api/forms/${formId}`, "GET"),
    submitFeedback: (formId, responseData) => apiRequest(`/api/forms/${formId}/responses`, "POST", responseData),
    getAnalytics: (formId) => apiRequest(`/api/forms/${formId}/analytics`, "GET"),
    getFacultySummary: (facultyName) => apiRequest(`/api/faculty/${encodeURIComponent(facultyName)}/summary`, "GET"),
    closeFeedbackForm: (formId) => apiRequest(`/api/forms/${formId}/close`, "PUT")
};
