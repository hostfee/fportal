window.addEventListener('DOMContentLoaded', function() {
    initializeNewSection(); 
    initializeSection('games');
    initializeSection('programs');
    initializeSection('utilities');
    initializeSection('others');
    setupMobileMenu();
    setupSearch();
    setupSmoothScrolling();
    setupThemeToggle();
    setupSectionHighlighting();
    setupRecommendedSpecsModal();
});

function initializeSection(sectionId) {
    if (!appData[sectionId]) return;

    const cardsGrid = document.getElementById(`${sectionId}-grid`);
    generateAppCards(sectionId, cardsGrid, appData[sectionId].apps);

    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.id = `${sectionId}-indicator`;
    cardsGrid.parentNode.insertBefore(scrollIndicator, cardsGrid.nextSibling);

    updateScrollIndicator(sectionId);
    cardsGrid.addEventListener('scroll', () => updateScrollIndicator(sectionId));

    setupEmptyStateHandling(sectionId);
    setupCategoryFilterDropdown(sectionId); 
}

function initializeNewSection() {
    const sectionId = 'new';
    const grid = document.getElementById('new-grid');
    if (!grid) return;

    const allApps = [];
    for (const key in appData) {
        if (appData[key].apps) {
            allApps.push(...appData[key].apps.map(app => ({...app, section: key })));
        }
    }

    const newApps = allApps.filter(app => app.isNew);
    generateAppCards(sectionId, grid, newApps);

    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.id = `${sectionId}-indicator`;
    grid.parentNode.insertBefore(scrollIndicator, grid.nextSibling);
    updateScrollIndicator(sectionId);
    grid.addEventListener('scroll', () => updateScrollIndicator(sectionId));
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
        <h3>Nothing found</h3>
        <p>Try selecting another category or changing the search query</p>
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

    document.addEventListener('filterComplete', function(event) {
        if (event.detail.sectionId === sectionId) {
            checkEmptyState();
        }
    });
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
        card.setAttribute('data-category', Array.isArray(app.category) ? app.category.join(',') : app.category);

        let recommendedSpecsButtonHTML = '';
        if (sectionId === 'games' && app.recommendedSpecs) {
            recommendedSpecsButtonHTML = `
                <button class="recommended-specs-btn" data-app-name="${app.name}" aria-label="Show recommended specifications">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"></path></svg>
                </button>
            `;
        }

        const newBadgeHTML = app.isNew ? `<div class="new-badge">New </div>` : '';

        card.innerHTML = `
        <div class="card-top-row">
            <div class="card-top-left">
                ${recommendedSpecsButtonHTML}
            </div>
            <div class="card-top-right">
                ${newBadgeHTML}
            </div>
        </div>
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
            <div class="card-actions">
                <a href="${app.downloadUrl}" class="download-btn" data-app-name="${app.name}" target="_blank" rel="noopener noreferrer">Download <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></a>
            </div>
        </div>
    `;
        container.appendChild(card);
    });
    setupDownloadButtons(container);
}

function setupCategoryFilterDropdown(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const filterBtn = section.querySelector('.filter-btn');
    const filterDropdown = section.querySelector('.filter-dropdown');

    if (!filterBtn || !filterDropdown) return;

    const categories = appData[sectionId]?.categories.filter(cat => cat !== 'all') || [];
    filterDropdown.innerHTML = `
        <div class="filter-header">
            <button class="tooltip reset-filters-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" height="18" width="18">
                    <path fill="#6366f1" d="M8.78842 5.03866C8.86656 4.96052 8.97254 4.91663 9.08305 4.91663H11.4164C11.5269 4.91663 11.6329 4.96052 11.711 5.03866C11.7892 5.11681 11.833 5.22279 11.833 5.33329V5.74939H8.66638V5.33329C8.66638 5.22279 8.71028 5.11681 8.78842 5.03866ZM7.16638 5.74939V5.33329C7.16638 4.82496 7.36832 4.33745 7.72776 3.978C8.08721 3.61856 8.57472 3.41663 9.08305 3.41663H11.4164C11.9247 3.41663 12.4122 3.61856 12.7717 3.978C13.1311 4.33745 13.333 4.82496 13.333 5.33329V5.74939H15.5C15.9142 5.74939 16.25 6.08518 16.25 6.49939C16.25 6.9136 15.9142 7.24939 15.5 7.24939H15.0105L14.2492 14.7095C14.2382 15.2023 14.0377 15.6726 13.6883 16.0219C13.3289 16.3814 12.8414 16.5833 12.333 16.5833H8.16638C7.65805 16.5833 7.17054 16.3814 6.81109 16.0219C6.46176 15.6726 6.2612 15.2023 6.25019 14.7095L5.48896 7.24939H5C4.58579 7.24939 4.25 6.9136 4.25 6.49939C4.25 6.08518 4.58579 5.74939 5 5.74939H6.16667H7.16638ZM7.91638 7.24996H12.583H13.5026L12.7536 14.5905C12.751 14.6158 12.7497 14.6412 12.7497 14.6666C12.7497 14.7771 12.7058 14.8831 12.6277 14.9613C12.5495 15.0394 12.4436 15.0833 12.333 15.0833H8.16638C8.05588 15.0833 7.94989 15.0394 7.87175 14.9613C7.79361 14.8831 7.74972 14.7771 7.74972 14.6666C7.74972 14.6412 7.74842 14.6158 7.74584 14.5905L6.99681 7.24996H7.91638Z" clip-rule="evenodd" fill-rule="evenodd"></path>
                </svg>
                <span class="tooltiptext">Remove</span>
            </button>
        </div>
        ${categories.map(category => `
            <label class="checkbox-container">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
                <input type="checkbox" value="${category}">
                <span class="checkmark"></span>
            </label>
        `).join('')}
    `;

    const resetBtn = filterDropdown.querySelector('.reset-filters-btn');
    resetBtn.addEventListener('click', () => {
        checkboxes.forEach(checkbox => checkbox.checked = false);
        filterAppsByCategories(sectionId, []);
    });

    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.filter-dropdown.show').forEach(dropdown => {
            if (dropdown !== filterDropdown) {
                dropdown.classList.remove('show');
            }
        });
        filterDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
        const isDropdown = e.target.closest('.filter-dropdown');
        const isFilterBtn = e.target.closest('.filter-btn');
        const isResetBtn = e.target.closest('.reset-filters-btn');

        if (!isDropdown && !isFilterBtn && !isResetBtn) {
            document.querySelectorAll('.filter-dropdown.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    const checkboxes = filterDropdown.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation(); 
        
            const selectedCategories = Array.from(checkboxes)
                .filter(i => i.checked)
                .map(i => i.value);
        
            filterAppsByCategories(sectionId, selectedCategories);
        
            setTimeout(() => {
                updateScrollIndicator(sectionId);
                document.dispatchEvent(new CustomEvent('filterComplete', { 
                    detail: { sectionId: sectionId } 
                }));
            }, 10);
        });
    });
}

function filterAppsByCategories(sectionId, selectedCategories) {
    const grid = document.getElementById(`${sectionId}-grid`);
    const appCards = grid.querySelectorAll('.app-card');
    const apps = appData[sectionId]?.apps || [];

    if (selectedCategories.length === 0) {
        appCards.forEach(card => {
            card.style.display = 'flex';
            card.classList.add('app-card-visible');
        });
    } else {
        appCards.forEach(card => {
            const appName = card.querySelector('.app-name').textContent;
            const app = apps.find(a => a.name === appName);
            if (app) {
                const appCategories = Array.isArray(app.category) ? app.category : [app.category];
                const isVisible = selectedCategories.every(cat => appCategories.includes(cat));
                //const isVisible = appCategories.some(cat => selectedCategories.includes(cat));

                if (isVisible) {
                    card.style.display = 'flex';
                    card.classList.add('app-card-visible');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('app-card-visible');
                }
            }
        });
    }
    
    grid.scrollLeft = 0;
    setTimeout(() => {
        updateScrollIndicator(sectionId);
        const checkEmptyStateEvent = new CustomEvent('filterComplete', { detail: { sectionId: sectionId } });
        document.dispatchEvent(checkEmptyStateEvent);
    }, 100);
}

function filterAppsByDropdown(sectionId, selectedCategories) {
    const appCards = document.querySelectorAll(`#${sectionId} .app-card`);
    const apps = appData[sectionId]?.apps || [];

    if (selectedCategories.length === 0) {
        appCards.forEach(card => {
            card.style.display = 'flex';
            card.classList.add('app-card-visible');
        });
    } else {
        appCards.forEach(card => {
            const appName = card.querySelector('.app-name').textContent;
            const app = apps.find(a => a.name === appName);
            if (app) {
                const appCategories = Array.isArray(app.category) ? app.category : [app.category];
                const isVisible = selectedCategories.some(cat => appCategories.includes(cat));

                if (isVisible) {
                    card.style.display = 'flex';
                    card.classList.add('app-card-visible');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('app-card-visible');
                }
            }
        });
    }

    const checkEmptyStateEvent = new CustomEvent('filterComplete', { detail: { sectionId: sectionId } });
    document.dispatchEvent(checkEmptyStateEvent);
    updateScrollIndicator(sectionId);
}

function generateCategoryTabs(sectionId, container, categories) {
    container.innerHTML = '';
    categories.forEach((category, index) => {
        const tab = document.createElement('div');
        tab.className = 'category-tab' + (category === 'all' ? ' active' : '');
        tab.setAttribute('data-filter', category);
        tab.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        container.appendChild(tab);
    });
}

function setupCategoryFiltering(sectionId) {
    const section = document.getElementById(sectionId);
    const categoryTabs = section.querySelectorAll('.category-tab');
    const apps = appData[sectionId]?.apps || [];
    const appCards = section.querySelectorAll('.app-card');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-filter');

            const checkboxes = section.querySelectorAll('.filter-dropdown input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);

            appCards.forEach(card => {
                const appName = card.querySelector('.app-name').textContent;
                const app = apps.find(a => a.name === appName);

                if (app) {
                    if (category === 'new') {
                        if (app.isNew) {
                            card.style.display = 'flex';
                            card.classList.add('app-card-visible');
                        } else {
                            card.style.display = 'none';
                            card.classList.remove('app-card-visible');
                        }
                    } else if (category === 'all' || (Array.isArray(app.category) && app.category.includes(category)) || (!Array.isArray(app.category) && app.category === category)) {
                        card.style.display = 'flex';
                        card.classList.add('app-card-visible');
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('app-card-visible');
                    }
                } else {
                    card.style.display = 'none';
                    card.classList.remove('app-card-visible');
                }
            });

            const container = document.getElementById(`${sectionId}-grid`);
            container.scrollLeft = 0;
            setTimeout(() => {
                updateScrollIndicator(sectionId);
                const checkEmptyStateEvent = new CustomEvent('filterComplete', { detail: { sectionId: sectionId } });
                document.dispatchEvent(checkEmptyStateEvent);
            }, 100);
        });
    });

     const initialCategoryTab = section.querySelector('.category-tab.active');
     if (initialCategoryTab) {
        initialCategoryTab.click();
     }
}

function setupDownloadButtons(container) {
    const buttons = container.querySelectorAll('a.download-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const downloadUrl = this.getAttribute('data-download-url');
            if (downloadUrl == "") {
                alert("Link not found or will be added soon!");
                return;
            }
        });
    });
}

function setupRecommendedSpecsModal() {
    const modal = document.getElementById('recommendedSpecsModal');
    const modalContent = document.getElementById('recommendedSpecsContent');
    const closeButton = document.querySelector('.close-button');

    if (!modal || !modalContent || !closeButton) {
        console.warn("Modal elements not found.");
        return;
    }

    modal.style.display = 'none';
    modal.classList.add('modal-hidden');

    document.addEventListener('click', function(event) {
        const target = event.target;
        const recommendedSpecsBtn = target.closest('.recommended-specs-btn');

        if (recommendedSpecsBtn) {
            const appName = recommendedSpecsBtn.getAttribute('data-app-name');
            const game = appData.games.apps.find(game => game.name === appName);

            if (game && game.recommendedSpecs) {
                modalContent.innerHTML = `
                    <h2>Recommended Specifications: ${game.name}</h2>
                    <p><strong>CPU:</strong> ${game.recommendedSpecs.cpu}</p>
                    <p><strong>GPU:</strong> ${game.recommendedSpecs.gpu}</p>
                    <p><strong>RAM:</strong> ${game.recommendedSpecs.ram}</p>
                `;
                modal.classList.remove('modal-hidden');
                modal.classList.add('modal-visible');
                modal.style.display = 'flex';
            } else {
                modalContent.innerHTML = `<h2>Specifications not available for ${appName}</h2>`;
                modal.classList.remove('modal-hidden');
                modal.classList.add('modal-visible');
                modal.style.display = 'flex';
            }
        }
    });

    closeButton.addEventListener('click', function() {
        modal.classList.remove('modal-visible');
        modal.classList.add('modal-hidden');
        modal.addEventListener('transitionend', function handler() {
            if (modal.classList.contains('modal-hidden')) {
                modal.style.display = 'none';
                modal.removeEventListener('transitionend', handler);
            }
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('modal-visible');
            modal.classList.add('modal-hidden');
            modal.addEventListener('transitionend', function handler() {
                if (modal.classList.contains('modal-hidden')) {
                    modal.style.display = 'none';
                    modal.removeEventListener('transitionend', handler);
                }
            });
        }
    });
}


function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.overlay');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    if (menuToggle && mobileMenu && overlay && mobileMenuClose) {
        function openMenu() {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        menuToggle.addEventListener('click', openMenu);
        mobileMenuClose.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        const mobileNavLinks = mobileMenu.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!document.getElementById('search-animation-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'search-animation-styles';
        styleSheet.innerHTML = `
            @keyframes single-pulse {
                0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7); }
                70% { box-shadow: 0 0 10px 5px rgba(66, 133, 244, 0); }
                100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
            }
            .search-highlight {
                animation: single-pulse 1.5s ease-in-out forwards;
                outline: 2px solid #4285f4;
                outline-offset: 2px;
                z-index: 10;
            }
        `;
        document.head.appendChild(styleSheet);
    }

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
                        const sectionElement = document.getElementById(section);
                        if (sectionElement) {
                            sectionElement.scrollIntoView({ behavior: 'smooth' });
                            setTimeout(() => {
                                const allCategoryTab = document.querySelector(`#${section}-tabs .category-tab[data-filter="all"]`) ||
                                             document.querySelector(`#${section}-tabs .category-tab:first-child`);
                                if (allCategoryTab) {
                                    allCategoryTab.click();
                                }
                                setTimeout(() => {
                                    const grid = document.getElementById(`${section}-grid`);
                                    const appCards = grid.querySelectorAll('.app-card');
                                    let targetCard = null;
                                    appCards.forEach(card => {
                                        const cardName = card.querySelector('.app-name');
                                        if (cardName && cardName.textContent === name) {
                                            targetCard = card;
                                        }
                                    });
                                if (targetCard) {
                                            const scrollLeft = targetCard.offsetLeft - (grid.clientWidth / 2) + (targetCard.clientWidth / 2);
                                            grid.scrollTo({
                                                left: scrollLeft,
                                                behavior: 'smooth'
                                            });
                                            setTimeout(() => {
                                                document.querySelectorAll('.search-highlight').forEach(el => {
                                                     el.classList.remove('search-highlight');
                                                     el.style.transition = '';
                                                     el.style.outline = '';
                                                     el.style.outlineOffset = '';
                                                });
                                                targetCard.style.transition = 'outline 0.5s ease-in-out';
                                                targetCard.style.outline = '2px solid #4285f4';
                                                targetCard.style.outlineOffset = '2px';

                                                targetCard.classList.add('search-highlight');
                                                setTimeout(() => {
                                                    targetCard.classList.remove('search-highlight');
                                                     targetCard.style.transition = '';
                                                     targetCard.style.outline = '';
                                                     targetCard.style.outlineOffset = '';
                                                }, 2000);
                                            }, 500);
                                }
                                }, 300);
                            }, 500);
                        }
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
                document.querySelectorAll('header .desktop-nav a, .mobile-menu .mobile-nav a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                document.querySelectorAll('main section').forEach(section => {
                     section.classList.remove('highlight-section');
                });
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                    targetElement.classList.remove('highlight-section');
                }, 1000);
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

document.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.js-inview, section').forEach(el => {
        observer.observe(el);
        el.classList.add('js-inview');
    });
};

document.addEventListener('DOMContentLoaded', observeElements);

function setupSectionHighlighting() {
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('header .desktop-nav a');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu .mobile-nav a');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
                 mobileNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(section => {
        observer.observe(section);
    });
}

function setupThemeToggle() {
    const themeToggleCheckbox = document.querySelector('.bb8-toggle__checkbox');
    const htmlElement = document.documentElement;

    function updateThemeState(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeToggleCheckbox) {
                themeToggleCheckbox.checked = true; 
            }
        } else {
            htmlElement.removeAttribute('data-theme'); 
            if (themeToggleCheckbox) {
                themeToggleCheckbox.checked = false; 
            }
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        updateThemeState(savedTheme); 
    } else {
        updateThemeState('light');
        localStorage.setItem('theme', 'light');
    }

    if (themeToggleCheckbox) { 
        themeToggleCheckbox.addEventListener('change', function() { 
            if (this.checked) { 
                localStorage.setItem('theme', 'dark');
                updateThemeState('dark');
            } else { 
                localStorage.setItem('theme', 'light');
                updateThemeState('light');
            }
        });
    }
}