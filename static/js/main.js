window.addEventListener('DOMContentLoaded', function() {
    initializeSection('games');
    initializeSection('programs');
    initializeSection('utilities');
    initializeSection('others');
    
    setupMobileMenu();
    
    setupSearch();
    
    setupSmoothScrolling();
});

function initializeSection(sectionId) {
    if (!appData[sectionId]) return;
    
    const tabsContainer = document.getElementById(`${sectionId}-tabs`);
    generateCategoryTabs(sectionId, tabsContainer, appData[sectionId].categories);
    
    const cardsGrid = document.getElementById(`${sectionId}-grid`);
    generateAppCards(sectionId, cardsGrid, appData[sectionId].apps);
    
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.id = `${sectionId}-indicator`;
    cardsGrid.parentNode.insertBefore(scrollIndicator, cardsGrid.nextSibling);
    
    updateScrollIndicator(sectionId);
    
    cardsGrid.addEventListener('scroll', function() {
        updateScrollIndicator(sectionId);
    });
    
    setupCategoryFiltering(sectionId);
    setupEmptyStateHandling(sectionId);
}

function setupEmptyStateHandling(sectionId) {
    const section = document.getElementById(sectionId);
    const grid = document.getElementById(`${sectionId}-grid`);
    
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.style.display = 'none';
    emptyState.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <h3>Нічого не знайдено</h3>
        <p>Спробуйте вибрати іншу категорію або змінити пошуковий запит</p>
    `;
    
    grid.parentNode.insertBefore(emptyState, grid.nextSibling);
    
    function checkEmptyState() {
        const visibleCards = grid.querySelectorAll('.app-card-visible');
        
        if (visibleCards.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            grid.style.display = 'flex';
            emptyState.style.display = 'none';
        }
    }
    
    const categoryTabs = section.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        const originalClickHandler = tab.onclick;
        tab.onclick = function(e) {
            if (originalClickHandler) {
                originalClickHandler.call(this, e);
            }
            
            setTimeout(checkEmptyState, 50);
        };
    });
    
    setTimeout(checkEmptyState, 100);
}

function updateScrollIndicator(sectionId) {
    const cardsGrid = document.getElementById(`${sectionId}-grid`);
    const indicator = document.getElementById(`${sectionId}-indicator`);
    
    if (!cardsGrid || !indicator) return;
    
    const scrollableWidth = cardsGrid.scrollWidth - cardsGrid.clientWidth;
    
    if (scrollableWidth <= 10) {
        indicator.style.display = 'none';
        return;
    }
    
    const totalSteps = Math.min(5, Math.ceil(scrollableWidth / 500) + 1);
    
    const currentStep = Math.floor((cardsGrid.scrollLeft / scrollableWidth) * (totalSteps - 1));
    
    indicator.innerHTML = '';
    
    for (let i = 0; i < totalSteps; i++) {
        const dot = document.createElement('span');
        if (i === currentStep) {
            dot.className = 'active';
        }
        indicator.appendChild(dot);
    }
    
    indicator.style.display = 'flex';
}

function setupScrollButtons() {
    const scrollLeftButtons = document.querySelectorAll('.scroll-left');
    const scrollRightButtons = document.querySelectorAll('.scroll-right');
    
    scrollLeftButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const container = document.getElementById(targetId);
            container.scrollBy({ left: -600, behavior: 'smooth' });
        });
    });
    
    scrollRightButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const container = document.getElementById(targetId);
            container.scrollBy({ left: 600, behavior: 'smooth' });
        });
    });
    
    document.querySelectorAll('.cards-grid').forEach(container => {
        container.addEventListener('scroll', function() {
            const scrollLeft = this.scrollLeft;
            const maxScrollLeft = this.scrollWidth - this.clientWidth;
            
            const scrollLeftButton = document.querySelector(`.scroll-left[data-target="${this.id}"]`);
            const scrollRightButton = document.querySelector(`.scroll-right[data-target="${this.id}"]`);
            
            if (scrollLeft <= 10) {
                scrollLeftButton.disabled = true;
            } else {
                scrollLeftButton.disabled = false;
            }
            
            if (scrollLeft >= maxScrollLeft - 10) {
                scrollRightButton.disabled = true;
            } else {
                scrollRightButton.disabled = false;
            }
        });
        
        container.dispatchEvent(new Event('scroll'));
    });
}

function generateCategoryTabs(sectionId, container, categories) {
    container.innerHTML = '';
    
    categories.forEach((category, index) => {
        const tab = document.createElement('div');
        tab.className = 'category-tab' + (index === 0 ? ' active' : '');
        tab.setAttribute('data-filter', category);
        tab.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        container.appendChild(tab);
    });
}

function generateAppCards(sectionId, container, apps) {
    container.innerHTML = '';
    
    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card app-card-visible';
        card.setAttribute('data-category', app.category);
        
        card.innerHTML = `
            <div class="app-image">
                <img src="${app.image}" alt="${app.name}" loading="lazy">
            </div>
            <div class="app-info">
                <h3 class="app-name">${app.name}</h3>
                <p class="app-description">${app.description}</p>
                ${app.originalUrl ? `<a href="${app.originalUrl}" class="app-description" target="_blank">Original</a>` : ''}
                <div class="app-meta">
                    <span>Version: ${app.version}</span>
                    <span>${app.size}</span>
                </div>
                <button class="download-btn" data-app-name="${app.name}" data-download-url="${app.downloadUrl}">⬇️ Download</button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    setupDownloadButtons(container);
}

function setupCategoryFiltering(sectionId) {
    const section = document.getElementById(sectionId);
    const categoryTabs = section.querySelectorAll('.category-tab');
    const appCards = section.querySelectorAll('.app-card');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-filter');
            let visibleCount = 0;
            
            appCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                    card.classList.add('app-card-visible');
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                    card.classList.remove('app-card-visible');
                }
            });
            
            const container = document.getElementById(`${sectionId}-grid`);
            container.scrollLeft = 0;
            
            setTimeout(() => {
                updateScrollIndicator(sectionId);
            }, 100);
        });
    });
}

function setupDownloadButtons(container) {
    const buttons = container.querySelectorAll('.download-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const downloadUrl = this.getAttribute('data-download-url');
            
            if (!downloadUrl) {
                alert("Link not found or will be added soon!");
                return;
            }
            
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.target = "_blank";
            downloadLink.click();
            
            this.innerHTML = '✓ Downloading...';
            this.style.backgroundColor = '#4caf50';
            
            setTimeout(() => {
                this.innerHTML = '⬇️ Download';
                this.style.backgroundColor = '';
            }, 1500);
        });
    });
}

function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }
            
            const allApps = [];
            for (const section in appData) {
                if (appData[section].apps) {
                    appData[section].apps.forEach(app => {
                        allApps.push({
                            ...app,
                            section: section
                        });
                    });
                }
            }
            
            const results = allApps.filter(app => 
                app.name.toLowerCase().includes(query) || 
                app.description.toLowerCase().includes(query)
            );
            
            if (results.length > 0) {
                searchResults.innerHTML = results.slice(0, 5).map(app => `
                    <div class="search-result-item" data-section="${app.section}" data-name="${app.name}">
                        <img src="${app.image}" alt="${app.name}">
                        <div class="search-result-info">
                            <h4>${app.name}</h4>
                            <p>${app.description}</p>
                        </div>
                    </div>
                `).join('');
                
                const resultItems = searchResults.querySelectorAll('.search-result-item');
                resultItems.forEach(item => {
                    item.addEventListener('click', function() {
                        const section = this.getAttribute('data-section');
                        const name = this.getAttribute('data-name');
                        
                        document.querySelector(`a[href="#${section}"]`).click();
                        
                        setTimeout(() => {
                            const appCard = document.querySelector(`.app-card .app-name:contains('${name}')`).closest('.app-card');
                            if (appCard) {
                                appCard.scrollIntoView({ behavior: 'smooth' });
                                appCard.classList.add('highlight');
                                setTimeout(() => {
                                    appCard.classList.remove('highlight');
                                }, 2000);
                            }
                        }, 500);
                        
                        searchInput.value = '';
                        searchResults.innerHTML = '';
                        searchResults.style.display = 'none';
                    });
                });
                
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="no-results">No apps found</div>';
                searchResults.style.display = 'block';
            }
        });
        
        window.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
            }
        });
    }
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

Element.prototype.contains = function(text) {
    return this.textContent.includes(text);
};

window.addEventListener('DOMContentLoaded', function() {
    const originalInit = initializeSection;
    
    window.initializeSection = function(sectionId) {
        originalInit(sectionId);
        
        const grid = document.getElementById(`${sectionId}-grid`);
        if (grid) {
            grid.addEventListener('scroll', function() {
                const maxScroll = this.scrollWidth - this.clientWidth;
                const scrollPosition = this.scrollLeft;
                
                const startFade = scrollPosition / 200;
                const endFade = (maxScroll - scrollPosition) / 200;
                
                this.style.setProperty('--start-fade', Math.min(1, startFade));
                this.style.setProperty('--end-fade', Math.min(1, endFade));
            });
            
            grid.dispatchEvent(new Event('scroll'));
        }
    };
});