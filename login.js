async function loginUser(email, password) {
    try {
        // 1️⃣ Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2️⃣ Fetch their profile from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("Logged in user data:", userData);

            if (userData.role === "admin") {
                showAdminDashboard();  // show admin view
            } else {
                showUserDashboard();   // show regular user view
            }
        }

    } catch (error) {
        console.error("Login error:", error.message);
        alert("Login failed: " + error.message);
    }
}