// register.js - Supabase Registration Logic

async function signUpUser(email, password, phone, gender) {
    // Safety check: Ensure supabase is initialized
    if (!window.supabase) {
        console.error("Supabase client not initialized. Check your index.html head.");
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

        // Note: If email confirmation is ON, user.id might exist but the user 
        // won't be "logged in" until they click the link in their email.
        if (user) {
            // 2. Insert profile data into 'profiles' table
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
                // If the table 'profiles' doesn't exist yet, this will fail.
                console.error("Error saving profile:", profileError.message);
                alert("Auth successful, but profile saving failed. Did you create the 'profiles' table?");
            } else {
                alert("Registration successful! Check your email for a confirmation link.");
            }
        }

    } catch (error) {
        console.error("Registration failed:", error.message);
        alert("Registration Error: " + error.message);
    }
}
