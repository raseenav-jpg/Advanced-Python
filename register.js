// register.js - Supabase Registration Logic

async function signUpUser(email, password, phone, gender) {
    if (!window.supabase) {
        alert("Supabase not initialized.");
        return;
    }

    try {
        // 1. Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        const user = data.user;

        // 2. Create the profile in the 'profiles' table
        if (user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    { 
                        id: user.id, 
                        email: email, 
                        phone: phone, 
                        gender: gender,
                        role: 'user' // Default to user, Admin must be set manually in DB
                    }
                ]);

            if (profileError) {
                console.error("Profile creation error:", profileError.message);
                alert("Auth successful, but profile creation failed. Check if 'profiles' table exists.");
            } else {
                alert("Registration successful! Please check your email for confirmation.");
            }
        }

    } catch (error) {
        console.error("Registration Error:", error.message);
        alert("Registration Failed: " + error.message);
    }
}
