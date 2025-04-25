document.addEventListener('DOMContentLoaded', function() {
    if (typeof appData === 'undefined') {
        window.appData = {
            games: { categories: ['all'], apps: [] },
            programs: { categories: ['all'], apps: [] },
            utilities: { categories: ['all'], apps: [] },
            others: { categories: ['all'], apps: [] }
        };
    }

    if (localStorage.getItem('admin_mode') === 'true') {
        initializeAdminInterface();
    }
    
    document.addEventListener('keydown', function(e) {
        console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey);
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            console.log('Admin hotkey triggered');
            toggleAdminMode();
        }
    });
});

const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: var(--primary, #4CAF50);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
        z-index: 1100;
    }
    
    .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(toastStyles);

function toggleAdminMode() {
    const currentMode = localStorage.getItem('admin_mode') === 'true';
    console.log('Current admin mode:', currentMode);
    localStorage.setItem('admin_mode', !currentMode);
    console.log('New admin mode:', !currentMode);
    
    if (!currentMode) {
        initializeAdminInterface();
        showToast('Admin mode activated');
    } else {
        removeAdminInterface();
        showToast('Admin mode deactivated');
    }
}

function initializeAdminInterface() {
    const adminButton = document.createElement('div');
    adminButton.className = 'admin-button';
    adminButton.innerHTML = '⚙️';
    adminButton.title = 'Open Admin Panel';
    document.body.appendChild(adminButton);
    
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    adminPanel.innerHTML = `
        <div class="admin-panel-header">
            <h2>Admin Panel</h2>
            <span class="close-admin">&times;</span>
        </div>
        <div class="admin-panel-content">
            <h3>Add New App</h3>
            <form id="addAppForm">
                <div class="form-group">
                    <label for="appSection">Section:</label>
                    <select id="appSection" required>
                        <option value="games">Games</option>
                        <option value="programs">Software</option>
                        <option value="utilities">Utilities</option>
                        <option value="others">Others</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="appName">Name:</label>
                    <input type="text" id="appName" required>
                </div>
                <div class="form-group">
                    <label for="appDescription">Description:</label>
                    <input type="text" id="appDescription" required>
                </div>
                <div class="form-group">
                    <label for="appCategory">Category:</label>
                    <input type="text" id="appCategory">
                </div>
                <div class="form-group">
                    <label for="appVersion">Version:</label>
                    <input type="text" id="appVersion" required>
                </div>
                <div class="form-group">
                    <label for="appSize">Size:</label>
                    <input type="text" id="appSize">
                </div>
                <div class="form-group">
                    <label for="appImage">Image Path:</label>
                    <input type="text" id="appImage" required placeholder="static/images/...">
                </div>
                <div class="form-group">
                    <label for="appDownloadUrl">Download URL:</label>
                    <input type="text" id="appDownloadUrl">
                </div>
                <div class="form-group">
                    <label for="appOriginalUrl">Original URL (Optional):</label>
                    <input type="text" id="appOriginalUrl">
                </div>
                <button type="submit" class="admin-submit-btn">Add App</button>
            </form>
            
            <h3>Export Data</h3>
            <button id="exportDataBtn" class="admin-action-btn">Export to JSON</button>
            
            <h3>Import Data</h3>
            <textarea id="importData" placeholder="Paste JSON data here..."></textarea>
            <button id="importDataBtn" class="admin-action-btn">Import Data</button>
        </div>
    `;
    
    const adminStyles = document.createElement('style');
    adminStyles.textContent = `
        .admin-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            background-color: var(--darker);
            border-radius: var(--border-radius);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: none;
            overflow-y: auto;
        }
        
        .admin-panel.show {
            display: block;
        }
        
        .admin-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .close-admin {
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .admin-panel-content {
            padding: 1rem;
        }
        
        .admin-panel h3 {
            margin: 1rem 0;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
        }
        
        .form-group input,
        .form-group select,
        #importData {
            width: 100%;
            padding: 0.6rem;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background-color: rgba(255, 255, 255, 0.05);
            color: var(--light);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        #importData:focus {
            outline: none;
            border-color: var(--primary);
        }
        
        #importData {
            min-height: 100px;
            font-family: monospace;
            margin-bottom: 1rem;
        }
        
        .admin-submit-btn,
        .admin-action-btn {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 0.7rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
            width: 100%;
            margin-bottom: 1rem;
        }
        
        .admin-submit-btn:hover,
        .admin-action-btn:hover {
            background-color: var(--primary-hover);
        }
        
        .admin-panel-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
        }
        
        .admin-panel-backdrop.show {
            display: block;
        }
    `;
    
    document.head.appendChild(adminStyles);
    document.body.appendChild(adminPanel);
    
    const backdrop = document.createElement('div');
    backdrop.className = 'admin-panel-backdrop';
    document.body.appendChild(backdrop);
    
    adminButton.addEventListener('click', function() {
        console.log('Admin button clicked');
        adminPanel.classList.add('show');
        backdrop.classList.add('show');
    });
    
    document.querySelector('.close-admin').addEventListener('click', function() {
        adminPanel.classList.remove('show');
        backdrop.classList.remove('show');
    });
    
    backdrop.addEventListener('click', function() {
        adminPanel.classList.remove('show');
        backdrop.classList.remove('show');
    });
    
    document.getElementById('addAppForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const section = document.getElementById('appSection').value;
        const newApp = {
            name: document.getElementById('appName').value,
            description: document.getElementById('appDescription').value,
            category: document.getElementById('appCategory').value,
            version: document.getElementById('appVersion').value,
            size: document.getElementById('appSize').value,
            image: document.getElementById('appImage').value,
            downloadUrl: document.getElementById('appDownloadUrl').value
        };
        
        const originalUrl = document.getElementById('appOriginalUrl').value;
        if (originalUrl) {
            newApp.originalUrl = originalUrl;
        }
        
        if (!appData[section]) {
            appData[section] = { categories: ['all'], apps: [] };
        }
        
        appData[section].apps.push(newApp);
        
        initializeSection(section);
        
        document.getElementById('addAppForm').reset();
        
        showToast('App added successfully');
    });
    
    document.getElementById('exportDataBtn').addEventListener('click', function() {
        const dataStr = JSON.stringify(appData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', 'fportal_data.json');
        exportLink.click();
        
        showToast('Data exported successfully');
    });
    
    document.getElementById('importDataBtn').addEventListener('click', function() {
        try {
            const importData = document.getElementById('importData').value;
            if (!importData) {
                throw new Error('No data to import');
            }
            
            const newData = JSON.parse(importData);
            
            if (!newData || typeof newData !== 'object') {
                throw new Error('Invalid data format');
            }
            
            appData = newData;
            
            for (const section in appData) {
                initializeSection(section);
            }
            
            document.getElementById('importData').value = '';
            
            showToast('Data imported successfully');
        } catch (error) {
            showToast('Error: ' + error.message, true);
        }
    });
}

function removeAdminInterface() {
    const adminButton = document.querySelector('.admin-button');
    if (adminButton) {
        adminButton.remove();
    }
    
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel) {
        adminPanel.remove();
    }
    
    const backdrop = document.querySelector('.admin-panel-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
    
    const adminStyles = document.querySelector('style:last-child');
    if (adminStyles) {
        adminStyles.remove();
    }
}

function showToast(message, isError = false) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    if (isError) {
        toast.style.backgroundColor = '#f44336';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}