// dashboard.js - Student Management Logic

// 1. Initialize Supabase (Using credentials from global index.html or re-defining if needed)
// Assuming SUPABASE_URL and SUPABASE_ANON_KEY are available globally from index.html
// If not, we use the ones defined in the head of dashboard.html
const supabase = window.supabase;

let students = [];

// 2. Auth Guard: Ensure only Admins can access this page
async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = '../index.html';
        return;
    }

    // Double check role from profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        alert("Access Denied: Admins Only");
        window.location.href = '../index.html';
    } else {
        console.log("🛡️ Admin authenticated");
        fetchStudents();
    }
}

// 3. Fetch Students from Database
async function fetchStudents() {
    console.log("📂 Fetching students...");
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching students:", error.message);
        return;
    }

    students = data;
    renderTable(students);
    updateStats();
}

// 4. Render Table Rows
function renderTable(dataList) {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';

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
                    <button class="btn btn-icon" style="color:red;" onclick="deleteStudent('${student.id}')" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// 6. Update Student
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
    
    const updatedData = {
        student_id: document.getElementById('edit_s_id').value,
        full_name: document.getElementById('edit_s_name').value,
        email: document.getElementById('edit_s_email').value,
        phone: document.getElementById('edit_s_phone').value,
        gender: document.getElementById('edit_s_gender').value,
        course: document.getElementById('edit_s_course').value,
        semester: document.getElementById('edit_s_semester').value,
        department: document.getElementById('edit_s_department').value,
        admission_year: document.getElementById('edit_s_admission_year').value
    };

    const { error } = await supabase
        .from('students')
        .update(updatedData)
        .eq('id', id);

    if (error) {
        alert("Error updating student: " + error.message);
    } else {
        alert("Student updated successfully!");
        closeModal('editModal');
        fetchStudents();
    }
});

// 7. Delete Student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

    if (error) {
        alert("Error deleting student: " + error.message);
    } else {
        fetchStudents();
    }
}

// 8. View Details
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

// 9. Search & Stats Helpers
function filterStudents() {
    const query = document.getElementById('studentSearch').value.toLowerCase();
    const filtered = students.filter(s => 
        s.full_name.toLowerCase().includes(query) || 
        s.student_id.toLowerCase().includes(query) || 
        s.email.toLowerCase().includes(query)
    );
    renderTable(filtered);
}

function updateStats() {
    document.getElementById('totalStudentsCount').textContent = students.length;
    const courses = [...new Set(students.map(s => s.course))];
    document.getElementById('totalCoursesCount').textContent = courses.length;
}

// Modal UI Helpers
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function logout() { supabase.auth.signOut(); window.location.href = '../index.html'; }

// Initialize
checkAdmin();
