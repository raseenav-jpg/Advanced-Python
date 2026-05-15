// register.js - Supabase Registration Logic with Debug Logs

async function signUpUser(email, password, phone, gender) {
    console.log("🚀 Registration started for:", email);

    if (!window.supabase) {
        console.error("❌ ERROR: Supabase is not initialized.");
        alert("Configuration Error: Supabase not found.");
        return;
    }

    try {
        console.log("🔐 Creating account in Supabase Auth...");
        // 1. Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error("❌ AUTH ERROR:", error.message);
            throw error;
        }

        const user = data.user;
        console.log("✅ Auth Account Created! User ID:", user?.id);

        // 2. Create the profile in the 'profiles' table
        if (user) {
            console.log("📂 Inserting profile data into 'profiles' table...");
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    { 
                        id: user.id, 
                        email: email, 
                        phone: phone, 
                        gender: gender,
                        role: 'user' 
                    }
                ]);

            if (profileError) {
                console.error("❌ DATABASE INSERT ERROR:", profileError.message);
                alert("Auth successful, but profile could not be saved: " + profileError.message);
            } else {
                console.log("🎉 Registration completely successful!");
                
                // UPDATE UI: Hide form and show success panel
                showRegistrationSuccess();
            }
        } else {
            console.warn("⚠️ User object is null. Email might be already registered.");
            alert("This email might already be registered. Try signing in.");
        }

    } catch (error) {
        console.error("💥 CRITICAL REGISTRATION FAILURE:", error.message);
        alert("Registration Failed: " + error.message);
    }
}

function showRegistrationSuccess() {
    // Hide the login form and role toggle
    document.getElementById('loginForm').style.display = 'none';
    if (document.querySelector('.link-row')) document.querySelector('.link-row').style.display = 'none';
    if (document.querySelector('.role-toggle')) document.querySelector('.role-toggle').style.display = 'none';
    if (document.getElementById('adminNote')) document.getElementById('adminNote').style.display = 'none';

    // Show the success panel
    const panel = document.getElementById('successPanel');
    panel.style.display = 'flex';
    
    // Customize the message for registration
    document.getElementById('successTitle').textContent = 'Account Created!';
    document.getElementById('successMsg').textContent = 'Please check your email inbox to confirm your account before logging in.';
    
    // Hide the data table since the user isn't logged in yet
    const table = document.getElementById('userDataTable');
    if (table) table.style.display = 'none';
}
