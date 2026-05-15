// login.js - Supabase Logic (Handles both Login and Register)

// 1. Global state for Auth Mode
window.isRegisterMode = false;

// 2. Toggle Function (called by the link in index.html)
window.toggleAuthMode = function() {
    window.isRegisterMode = !window.isRegisterMode;
    console.log("🔄 Auth Mode Switched. Is Register Mode:", window.isRegisterMode);

    const submitBtn = document.getElementById('submitBtn');
    const toggleRow = document.getElementById('toggleRow');
    const headerTitle = document.querySelector('.header h1');
    const headerSub = document.getElementById('subText');

    if (window.isRegisterMode) {
        submitBtn.textContent = 'Create Account';
        toggleRow.innerHTML = 'Already have an account? <a href="javascript:void(0)" onclick="toggleAuthMode()">Sign In →</a>';
        headerTitle.innerHTML = 'Join us<span class="accent-dot">.</span>';
        headerSub.textContent = 'Enter your details to create an account';
    } else {
        submitBtn.textContent = 'Sign In';
        toggleRow.innerHTML = 'Don\'t have an account? <a href="javascript:void(0)" onclick="toggleAuthMode()">Create one →</a>';
        headerTitle.innerHTML = 'Welcome back<span class="accent-dot">.</span>';
        headerSub.textContent = 'Sign in to your account to continue';
    }
}

// 3. Form Submission Listener
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log("🚀 Form submitted. Mode:", window.isRegisterMode ? "REGISTER" : "LOGIN");

    if (!window.supabase) {
        console.error("❌ ERROR: Supabase is not initialized.");
        return;
    }

    const email = document.getElementById('email').value.trim();
    const pw = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value;

    // Validation
    const eE = !validateEmail(email);
    const eP = !validatePassword(pw);
    const ePh = !validatePhone(phone);
    const eG = !gender;

    showErr('emailErr', eE); markField('email', eE);
    showErr('pwErr', eP); markField('password', eP);
    showErr('phoneErr', ePh); markField('phone', ePh);
    showErr('genderErr', eG); markField('gender', eG);

    if (eE || eP || ePh || eG) {
        console.warn("⚠️ Validation failed.");
        return;
    }

    if (window.isRegisterMode) {
        console.log("➡️ Executing Registration Flow...");
        signUpUser(email, pw, phone, gender);
    } else {
        console.log("➡️ Executing Login Flow...");
        performLogin(email, pw, phone, gender);
    }
});

async function performLogin(email, pw, phone, gender) {
    try {
        console.log("🔐 Authenticating with Supabase...");
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pw,
        });

        if (error) throw error;

        console.log("✅ Login successful. Fetching profile for ID:", data.user.id);
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error("❌ PROFILE FETCH ERROR:", profileError.message);
            console.warn("ℹ️ Tip: Check if a row exists in the 'profiles' table for this User ID.");
        }

        const userRole = profile ? profile.role : 'user';
        handleLoginSuccess(email, phone, gender, userRole);

    } catch (error) {
        console.error("❌ LOGIN ERROR:", error.message);
        alert("Login Failed: " + error.message);
    }
}

function handleLoginSuccess(email, phone, gender, role) {
    console.log("🕵️ Role check in progress... User role is:", role);
    
    if (role === 'admin') {
        console.log("🛡️ SUCCESS: Admin detected. Redirecting to Dashboard...");
        try {
            window.location.href = 'admin/dashboard.html';
        } catch (err) {
            console.error("❌ Redirection failed:", err);
            alert("Could not find admin/dashboard.html. Please check if the folder exists.");
        }
    } else {
        console.log("👤 USER: Standard student detected. Showing User Panel.");
        document.getElementById('loginForm').style.display = 'none';
        if (document.querySelector('.link-row')) document.querySelector('.link-row').style.display = 'none';
        
        const panel = document.getElementById('successPanel');
        panel.style.display = 'flex';
        document.getElementById('successTitle').textContent = 'Welcome Back!';
    }
}