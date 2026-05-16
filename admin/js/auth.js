// js/auth.js

// Initialize Supabase Client
const SUPABASE_URL = 'https://mmmggjhgfmkhnzubkoib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbWdnamhnZm1raG56dWJrb2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzU0NzgsImV4cCI6MjA5NDQxMTQ3OH0.RgLR8AYaHwXJncqzL4zVmvQMrlg2BUkH7IFGIzyC0kU';

// Create the client instance and assign it to a global variable
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;

// Auth Guard: Ensure user is logged in
async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error || !session) {
        console.warn("No active session found. Redirecting to login...");
        window.location.replace('../index.html');
        return false;
    }
    
    return true;
}

// Logout function
async function logout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        // Clear local storage items if any exist
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '../index.html';
    } catch (err) {
        console.error("Error during logout:", err.message);
        alert("Failed to logout: " + err.message);
    }
}

// Automatically check auth when included
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    
    // Attach event listener to logout button if it exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
