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
                console.warn("ℹ️ Tip: Check if 'profiles' table exists and RLS allows inserts.");
                alert("Auth successful, but could not save profile to database: " + profileError.message);
            } else {
                console.log("🎉 Registration completely successful!");
                alert("Registration successful! Please check your email for a confirmation link.");
            }
        } else {
            console.warn("⚠️ User object is null. This can happen if the email is already registered or needs confirmation.");
        }

    } catch (error) {
        console.error("💥 CRITICAL REGISTRATION FAILURE:", error.message);
        alert("Registration Failed: " + error.message);
    }
}
