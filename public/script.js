// Globals
let currentApiKey = null;
let isVerified = false;

// Nayi API Key generate karne ka function
function generateApiKey() {
    fetch('/api/admin/generate-key', {
        method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
        const resBox = document.getElementById('new-key-result');
        resBox.innerHTML = `<strong>Success!</strong> Your new API Key is: <br><br><span style="color:var(--secondary); font-size:1.2rem;">${data.apiKey}</span><br><br>Isko copy karein aur niche auth box me verify karein. User ke paas ye key honi chahiye data nikalne ke liye.`;
        resBox.classList.remove('hidden');
    })
    .catch(err => alert("Error generating API key"));
}

// User ki daali hui API Key verify karne ka function
function verifyApiKey() {
    const key = document.getElementById('userApiKey').value.trim();
    if (!key) {
        alert("Please enter an API Key in the box.");
        return;
    }

    fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
    })
    .then(res => res.json())
    .then(data => {
        const statusMsg = document.getElementById('auth-status');
        if (data.valid) {
            currentApiKey = key;
            isVerified = true;
            statusMsg.innerHTML = "Status: Verified Successfully ✅ (Dashboard Unlocked)";
            statusMsg.style.color = "var(--secondary)";
            
            // Lock hata dein
            const dashboard = document.getElementById('api-dashboard');
            dashboard.classList.remove('locked');
            const overlay = dashboard.querySelector('.overlay-lock');
            if(overlay) overlay.style.display = 'none';
            
            // Preview data load karein
            loadPreviewStudents();
        } else {
            currentApiKey = null;
            isVerified = false;
            statusMsg.innerHTML = "Status: Invalid API Key ❌";
            statusMsg.style.color = "red";
            
            // Lock laga dein
            const dashboard = document.getElementById('api-dashboard');
            dashboard.classList.add('locked');
            const overlay = dashboard.querySelector('.overlay-lock');
            if(overlay) overlay.style.display = 'flex';
        }
    })
    .catch(err => {
        console.error(err);
        alert("Error verifying API key");
    });
}

// API se 10 students ka preview fetch karna
function loadPreviewStudents() {
    if (!isVerified) return;
    
    // Header me API key bhejni hai 'x-api-key' nam se
    fetch('/api/students', {
        headers: { 'x-api-key': currentApiKey }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) throw new Error(data.error);
        
        const grid = document.getElementById('student-grid');
        grid.innerHTML = ""; // purana clear karo
        const previewData = data.slice(0, 10); 
        
        previewData.forEach(student => {
            const initial = student.name.charAt(0);
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <div class="avatar">${initial}</div>
                <h3>${student.name}</h3>
                <div class="student-id">ID: ${student.id} | Age: ${student.age}</div>
            `;
            grid.appendChild(card);
        });
    })
    .catch(error => console.error('Preview error:', error));
}

// Saare students fetch karna
function fetchAllStudents() {
    if (!isVerified) return alert("Pehle API key verify karein!");
    
    const resultBox = document.getElementById('all-students-result');
    fetch('/api/students', {
        headers: { 'x-api-key': currentApiKey }
    })
    .then(response => response.json())
    .then(data => {
        resultBox.textContent = JSON.stringify(data, null, 2);
        resultBox.classList.remove('hidden');
    })
    .catch(error => {
        resultBox.textContent = "Error fetching data.";
        resultBox.classList.remove('hidden');
    });
}

// Single student fetch karna
function fetchStudent() {
    if (!isVerified) return alert("Pehle API key verify karein!");
    
    const id = document.getElementById('studentId').value;
    const resultBox = document.getElementById('result');
    
    if (!id) {
        resultBox.textContent = "Please enter an ID.";
        resultBox.classList.remove('hidden');
        return;
    }

    fetch(`/api/students/${id}`, {
        headers: { 'x-api-key': currentApiKey }
    })
    .then(response => {
        if(response.status === 401) throw new Error("Unauthorized");
        return response.json();
    })
    .then(data => {
        resultBox.textContent = JSON.stringify(data, null, 2);
        resultBox.classList.remove('hidden');
    })
    .catch(error => {
        resultBox.textContent = "Error fetching data (Not Found or Invalid Key).";
        resultBox.classList.remove('hidden');
    });
}

// Naya search function (Name aur Age se dhundhne ke liye)
function searchStudents() {
    if (!isVerified) return alert("Pehle API key verify karein!");
    
    const name = document.getElementById('searchName').value;
    const minAge = document.getElementById('searchMinAge').value;
    const maxAge = document.getElementById('searchMaxAge').value;
    const resultBox = document.getElementById('search-result');
    
    // Query parameters banana
    let queryParams = [];
    if (name) queryParams.push(`name=${encodeURIComponent(name)}`);
    if (minAge) queryParams.push(`minAge=${minAge}`);
    if (maxAge) queryParams.push(`maxAge=${maxAge}`);
    
    const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

    fetch(`/api/students${queryString}`, {
        headers: { 'x-api-key': currentApiKey }
    })
    .then(response => {
        if(response.status === 401) throw new Error("Unauthorized");
        return response.json();
    })
    .then(data => {
        resultBox.textContent = `Total Found: ${data.length} student(s)\n\n` + JSON.stringify(data, null, 2);
        resultBox.classList.remove('hidden');
    })
    .catch(error => {
        resultBox.textContent = "Error searching data.";
        resultBox.classList.remove('hidden');
    });
}
