// login.js - Supabase Logic (Handles both Login and Register)

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Safety check
    if (!window.supabase) {
        console.error("❌ ERROR: Supabase is not initialized.");
        return;
    }

    const email = document.getElementById('email').value.trim();
    const pw = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value;

    // 1. Validation
    const eE = !validateEmail(email);
    const eP = !validatePassword(pw);
    const ePh = !validatePhone(phone);
    const eG = !gender;

    showErr('emailErr', eE); markField('email', eE);
    showErr('pwErr', eP); markField('password', eP);
    showErr('phoneErr', ePh); markField('phone', ePh);
    showErr('genderErr', eG); markField('gender', eG);

    if (eE || eP || ePh || eG) return;

    // 2. Check if we are Registering or Logging in
    if (isRegisterMode) {
        console.log("🚀 Switching to Registration Flow...");
        // Call the function from register.js
        signUpUser(email, pw, phone, gender);
    } else {
        console.log("🔐 Switching to Login Flow...");
        performLogin(email, pw, phone, gender);
    }
});

async function performLogin(email, pw, phone, gender) {
    try {
        console.log("🔐 Sending credentials to Supabase Auth...");
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pw,
        });

        if (error) {
            console.error("❌ AUTH ERROR:", error.message);
            throw error;
        }

        const user = data.user;
        console.log("✅ Auth Successful! User ID:", user.id);

        // Fetch the Role (Admin/User) from your 'profiles' table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("❌ DATABASE ERROR (Profiles Table):", profileError.message);
        }

        const userRole = profile ? profile.role : 'user';
        console.log("👤 Final User Role determined as:", userRole);

        handleLoginSuccess(email, phone, gender, userRole);

    } catch (error) {
        console.error("💥 CRITICAL LOGIN FAILURE:", error.message);
        alert("Login Failed: " + error.message);
    }
}

function handleLoginSuccess(email, phone, gender, role) {
    console.log("✨ Transitioning to success UI...");
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