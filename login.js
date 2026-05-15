// login.js - Supabase Login Logic

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // 1. Safety check
    if (!window.supabase) {
        alert("Supabase not initialized. Check API keys in index.html");
        return;
    }

    const email = document.getElementById('email').value.trim();
    const pw = document.getElementById('password').value;
    
    // We get these from the form if they exist, otherwise default to empty
    const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : "";
    const gender = document.getElementById('gender') ? document.getElementById('gender').value : "";

    // 2. Form Validation (using helpers in index.html)
    const eE = !validateEmail(email);
    const eP = !validatePassword(pw);
    
    showErr('emailErr', eE); markField('email', eE);
    showErr('pwErr', eP); markField('password', eP);

    if (eE || eP) return;

    try {
        // 3. Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pw,
        });

        if (error) throw error;

        const user = data.user;

        // 4. Fetch the Role (Admin/User) from your 'profiles' table
        // This is where you manually set 'admin' in the database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.warn("Profile not found, defaulting to 'user'.", profileError.message);
        }

        const userRole = profile ? profile.role : 'user';

        // 5. Update UI
        handleLoginSuccess(email, phone, gender, userRole);

    } catch (error) {
        console.error("Login Error:", error.message);
        alert("Login Failed: " + error.message);
    }
});

function handleLoginSuccess(email, phone, gender, role) {
    document.getElementById('loginForm').style.display = 'none';
    if (document.querySelector('.link-row')) document.querySelector('.link-row').style.display = 'none';
    if (document.querySelector('.role-toggle')) document.querySelector('.role-toggle').style.display = 'none';
    if (document.getElementById('adminNote')) document.getElementById('adminNote').style.display = 'none';

    const panel = document.getElementById('successPanel');
    panel.style.display = 'flex';

    if (role === 'admin') {
        document.getElementById('successTitle').textContent = 'Admin Access Granted';
        document.getElementById('successMsg').textContent = 'You have full visibility into user data below.';
        const table = document.getElementById('userDataTable');
        if (table) table.style.display = 'block';
        document.getElementById('dEmail').textContent = email;
        document.getElementById('dPhone').textContent = '+91 ' + phone;
        document.getElementById('dGender').textContent = gender.charAt(0).toUpperCase() + gender.slice(1);
        document.getElementById('dTime').textContent = new Date().toLocaleString('en-IN');
    } else {
        document.getElementById('successTitle').textContent = 'Welcome Back!';
        document.getElementById('successMsg').textContent = 'You are now signed in as a User.';
    }
}