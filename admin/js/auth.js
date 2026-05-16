// js/auth.js

// Initialize Supabase Client
const SUPABASE_URL = 'https://mmmggjhgfmkhnzubkoib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbWdnamhnZm1raG56dWJrb2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzU0NzgsImV4cCI6MjA5NDQxMTQ3OH0.RgLR8AYaHwXJncqzL4zVmvQMrlg2BUkH7IFGIzyC0kU';
window.supabase = window.supabase || supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Guard: Ensure user is logged in
async function checkAuth() {
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error || !session) {
        console.warn("No active session found. Redirecting to login...");
        window.location.replace('../index.html');
        return false;
    }
    
    // Optional: Double check admin role here if necessary
    // Example: const { data: profile } = await window.supabase.from('profiles').select('role').eq('id', session.user.id).single();
    // if (!profile || profile.role !== 'admin') { ... redirect ... }

    return true;
}

// Logout function
async function logout() {
    try {
        const { error } = await window.supabase.auth.signOut();
        if (error) throw error;
        
        // Clear local storage items if any exist
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.replace('../index.html');
    } catch (err) {
        console.error("Error during logout:", err.message);
        alert("Failed to logout: " + err.message);
    }
}

// Automatically check auth when included, unless disabled
// Give pages time to load before redirecting to avoid FOUC
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
});
