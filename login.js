// login.js - Supabase Login Logic with Debug Logs

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log("🚀 Login process started...");

    // 1. Safety check
    if (!window.supabase) {
        console.error("❌ ERROR: Supabase is not initialized. Check index.html head for API keys.");
        alert("Configuration Error: Supabase not found.");
        return;
    }

    const email = document.getElementById('email').value.trim();
    const pw = document.getElementById('password').value;
    
    console.log("📝 Attempting login for email:", email);

    // 2. Form Validation
    const eE = !validateEmail(email);
    const eP = !validatePassword(pw);
    
    showErr('emailErr', eE); markField('email', eE);
    showErr('pwErr', eP); markField('password', eP);

    if (eE || eP) {
        console.warn("⚠️ Validation failed: Email or Password format is incorrect.");
        return;
    }

    try {
        console.log("🔐 Sending credentials to Supabase Auth...");
        // 3. Sign in with Supabase
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

        // 4. Fetch the Role (Admin/User) from your 'profiles' table
        console.log("📂 Fetching user role from 'profiles' table...");
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("❌ DATABASE ERROR (Profiles Table):", profileError.message);
            console.warn("ℹ️ Tip: Make sure the 'profiles' table exists and has a row for this user.");
        }

        const userRole = profile ? profile.role : 'user';
        console.log("👤 Final User Role determined as:", userRole);

        // 5. Update UI
        handleLoginSuccess(email, "", "", userRole);

    } catch (error) {
        console.error("💥 CRITICAL LOGIN FAILURE:", error.message);
        alert("Login Failed: " + error.message);
    }
});

function handleLoginSuccess(email, phone, gender, role) {
    console.log("✨ Transitioning to success UI...");
    document.getElementById('loginForm').style.display = 'none';
    if (document.querySelector('.link-row')) document.querySelector('.link-row').style.display = 'none';
    if (document.querySelector('.role-toggle')) document.querySelector('.role-toggle').style.display = 'none';
    if (document.getElementById('adminNote')) document.getElementById('adminNote').style.display = 'none';

    const panel = document.getElementById('successPanel');
    panel.style.display = 'flex';

    if (role === 'admin') {
        console.log("🛡️ Loading Admin Dashboard View");
        document.getElementById('successTitle').textContent = 'Admin Access Granted';
        document.getElementById('successMsg').textContent = 'You have full visibility into user data below.';
        const table = document.getElementById('userDataTable');
        if (table) table.style.display = 'block';
        document.getElementById('dEmail').textContent = email;
        document.getElementById('dTime').textContent = new Date().toLocaleString('en-IN');
    } else {
        console.log("👤 Loading Standard User View");
        document.getElementById('successTitle').textContent = 'Welcome Back!';
        document.getElementById('successMsg').textContent = 'You are now signed in as a User.';
    }
}