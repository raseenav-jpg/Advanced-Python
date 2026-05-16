// add-student.js

const supabase = window.supabase;





// UI Helpers
function showMessage(msg, type) {
    const msgDiv = document.getElementById('formMessage');
    msgDiv.textContent = msg;
    msgDiv.className = `message ${type}`;
    msgDiv.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
        msgDiv.classList.add('hidden');
    }, 5000);
}

function setLoading(isLoading) {
    const btnText = document.querySelector('.btn-text');
    const spinner = document.getElementById('loadingSpinner');
    const saveBtn = document.getElementById('saveBtn');

    if (isLoading) {
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        saveBtn.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        saveBtn.disabled = false;
    }
}

// Form Submission
document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    // Collect data
    const studentData = {
        student_id: document.getElementById('student_id').value.trim(),
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        gender: document.getElementById('gender').value,
        course: document.getElementById('course').value.trim(),
        semester: document.getElementById('semester').value.trim(),
        department: document.getElementById('department').value.trim(),
        admission_year: document.getElementById('admission_year').value.trim()
    };

    try {
        // 1. Check for duplicate student_id
        const { data: idCheck } = await supabase
            .from('students')
            .select('student_id')
            .eq('student_id', studentData.student_id)
            .single();
            
        if (idCheck) {
            showMessage('A student with this ID already exists.', 'error');
            setLoading(false);
            return;
        }

        // 2. Check for duplicate email
        const { data: emailCheck } = await supabase
            .from('students')
            .select('email')
            .eq('email', studentData.email)
            .single();
            
        if (emailCheck) {
            showMessage('A student with this Email already exists.', 'error');
            setLoading(false);
            return;
        }

        // 3. Insert new student
        const { error } = await supabase
            .from('students')
            .insert([studentData]);

        if (error) {
            throw error;
        }

        // Success
        showMessage('Student added successfully!', 'success');
        document.getElementById('addStudentForm').reset();
        
    } catch (error) {
        console.error("Error adding student:", error);
        showMessage(error.message || 'Failed to add student. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
});


