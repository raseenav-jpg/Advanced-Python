// dashboard.js - Student Management Logic

let students = [];

// 1. Toast Notification Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 2. Fetch Students from Database
async function fetchStudents() {
    console.log("📂 Fetching students...");
    const { data, error } = await window.supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching students:", error.message);
        showToast("Error fetching students: " + error.message, 'error');
        return;
    }

    students = data || [];
    renderTable(students);
    updateStats();
}

// 3. Render Table Rows
function renderTable(dataList) {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No students found.</td></tr>';
        return;
    }

    dataList.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${student.student_id}</strong></td>
            <td>${student.full_name}</td>
            <td>${student.course}</td>
            <td>${student.email}</td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-icon" onclick="viewDetails('${student.id}')" title="View">👁️</button>
                    <button class="btn btn-icon" onclick="openEditModal('${student.id}')" title="Edit">✏️</button>
                    <button class="btn btn-icon" style="color:var(--danger); border-color:var(--danger);" onclick="deleteStudent('${student.id}')" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 4. Update Student
async function openEditModal(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    document.getElementById('edit_record_id').value = student.id;
    document.getElementById('edit_s_id').value = student.student_id;
    document.getElementById('edit_s_name').value = student.full_name;
    document.getElementById('edit_s_email').value = student.email;
    document.getElementById('edit_s_phone').value = student.phone;
    document.getElementById('edit_s_gender').value = student.gender;
    document.getElementById('edit_s_course').value = student.course;
    document.getElementById('edit_s_semester').value = student.semester;
    document.getElementById('edit_s_department').value = student.department;
    document.getElementById('edit_s_admission_year').value = student.admission_year;

    openModal('editModal');
}

document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit_record_id').value;
    
    // Validate inputs
    const updatedData = {
        student_id: document.getElementById('edit_s_id').value.trim(),
        full_name: document.getElementById('edit_s_name').value.trim(),
        email: document.getElementById('edit_s_email').value.trim(),
        phone: document.getElementById('edit_s_phone').value.trim(),
        gender: document.getElementById('edit_s_gender').value,
        course: document.getElementById('edit_s_course').value.trim(),
        semester: document.getElementById('edit_s_semester').value.trim(),
        department: document.getElementById('edit_s_department').value.trim(),
        admission_year: document.getElementById('edit_s_admission_year').value.trim()
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    try {
        // Optional: Check if the new ID or Email already exists for a DIFFERENT student
        // Assuming the user knows what they are doing for now to keep it simple, but we rely on Supabase unique constraints
        const { error } = await window.supabase
            .from('students')
            .update(updatedData)
            .eq('id', id);

        if (error) {
            throw error;
        }

        showToast("Student updated successfully!", 'success');
        closeModal('editModal');
        await fetchStudents(); // Refresh table
    } catch (error) {
        console.error("Error updating student:", error);
        showToast(error.message || "Error updating student.", 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// 5. Delete Student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;

    try {
        const { error } = await window.supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast("Student deleted successfully!", 'success');
        await fetchStudents(); // Refresh table and stats immediately
    } catch (error) {
        console.error("Error deleting student:", error);
        showToast("Error deleting student: " + error.message, 'error');
    }
}

// 6. View Details
function viewDetails(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    const detailHtml = `
        <div class="detail-row"><span class="label">Student ID</span><span class="value">${student.student_id}</span></div>
        <div class="detail-row"><span class="label">Full Name</span><span class="value">${student.full_name}</span></div>
        <div class="detail-row"><span class="label">Email</span><span class="value">${student.email}</span></div>
        <div class="detail-row"><span class="label">Phone</span><span class="value">${student.phone}</span></div>
        <div class="detail-row"><span class="label">Gender</span><span class="value">${student.gender}</span></div>
        <div class="detail-row"><span class="label">Course</span><span class="value">${student.course}</span></div>
        <div class="detail-row"><span class="label">Semester</span><span class="value">${student.semester}</span></div>
        <div class="detail-row"><span class="label">Department</span><span class="value">${student.department}</span></div>
        <div class="detail-row"><span class="label">Admission Year</span><span class="value">${student.admission_year}</span></div>
    `;
    document.getElementById('studentDetailView').innerHTML = detailHtml;
    openModal('detailModal');
}

// 7. Search & Stats Helpers
function filterStudents() {
    const query = document.getElementById('studentSearch').value.toLowerCase();
    const filtered = students.filter(s => 
        s.full_name.toLowerCase().includes(query) || 
        s.student_id.toLowerCase().includes(query) || 
        s.email.toLowerCase().includes(query) ||
        s.course.toLowerCase().includes(query)
    );
    renderTable(filtered);
}

function updateStats() {
    document.getElementById('totalStudentsCount').textContent = students.length;
    const courses = [...new Set(students.map(s => s.course))];
    document.getElementById('totalCoursesCount').textContent = courses.length;
}

// 8. Modal UI Helpers
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Initialize
// We wait for DOMContentLoaded to ensure auth.js has checked the session
document.addEventListener('DOMContentLoaded', () => {
    // If auth is okay, fetch students
    // We can assume if they are on this page, auth.js hasn't redirected them yet
    fetchStudents();
});
