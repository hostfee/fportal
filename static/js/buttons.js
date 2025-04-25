document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const parentSection = this.closest('section');
        parentSection.querySelectorAll('.category-tab').forEach(t => {
            t.classList.remove('active');
        });
        this.classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
document.querySelectorAll('section').forEach(section => {
    const categoryTabs = section.querySelectorAll('.category-tab');
    const appCards = section.querySelectorAll('.app-card');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        
            const category = this.getAttribute('data-filter');
        
            appCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
});


const downloadUrls = {
    "Minecraft": "",
    "Prism": "https://drive.google.com/uc?export=download&id=19smzCQtCblxNS0hmjyaBXbozkuP8hTKj",
    "Krnl": "https://krnl.cat/",
    "Delta": "https://deltaexploits.gg/delta-executor-mobile",
    "Wallpaper Engine": "https://drive.google.com/file/d/1YqEH3JKtq87wPJfXu995ttxDpnQ-5aIE/view?usp=sharing",
    "Rainmeter": "https://www.rainmeter.net/",
    "Microsoft Office": "https://gravesoft.dev/office_c2r_links",
    "Share X": "https://getsharex.com/",
    "CCleaner": "https://www.ccleaner.com/ccleaner/download",
    "WinRAR": "https://www.win-rar.com/postdownload.html?&L=0",
    "MSI Afterburner": "https://www.msi.com/Landing/afterburner/graphics-cards",
    "GPU-Z": "https://www.techpowerup.com/download/techpowerup-gpu-z/",
    "Wallpapers": "https://drive.google.com/file/d/1MdcU6Xp01TCk8rqZXU_JEvwt19VMTpVT/view?usp=sharing",
    "MAS" : "https://github.com/massgravel/Microsoft-Activation-Scripts",
    "Malwarebytes" : "https://www.malwarebytes.com/mwb-download/thankyou",
    
};

document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', function() {
        const appName = this.closest('.app-card').querySelector('.app-name').textContent;
        const downloadUrl = downloadUrls[appName] || "#"; 
        
        if (downloadUrl === "#") {
            alert("Link not found or Will added soon!");
            return;
        }
        
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.target = "_blank";
        
        this.innerHTML = '✓ Donwloading...';
        this.style.backgroundColor = '#4caf50';
        
        downloadLink.click();
        
        setTimeout(() => {
            this.innerHTML = '⬇️ Download';
            this.style.backgroundColor = '';
        }, 1500);
    });
});