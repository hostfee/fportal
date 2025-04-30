window.addEventListener('DOMContentLoaded', function() {
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

            appCards.forEach(card => {
                const appName = card.querySelector('.app-name').textContent;
                const app = apps.find(a => a.name === appName);

                if (app) {
                    if (category === 'all' || (Array.isArray(app.category) && app.category.includes(category)) || (!Array.isArray(app.category) && app.category === category)) {
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
         const initialCategory = initialCategoryTab.getAttribute('data-filter');
         const grid = document.getElementById(`${sectionId}-grid`);
         const apps = appData[sectionId]?.apps || [];
         const appCards = section.querySelectorAll('.app-card');
         appCards.forEach(card => {
             const appName = card.querySelector('.app-name').textContent;
             const app = apps.find(a => a.name === appName);
             if (app) {
                 if (initialCategory === 'all' || (Array.isArray(app.category) && app.category.includes(initialCategory)) || (!Array.isArray(app.category) && app.category === initialCategory)) {
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
         const checkEmptyStateEvent = new CustomEvent('filterComplete', { detail: { sectionId: sectionId } });
         document.dispatchEvent(checkEmptyStateEvent);
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
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    const htmlElement = document.documentElement;
    const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

    function updateThemeIcon(theme) {
        themeToggleBtns.forEach(btn => {
            if (theme === 'dark') {
                 if (btn.classList.contains('btn-secondary')) {
                    btn.innerHTML = moonIcon + ' Theme';
                } else {
                     btn.innerHTML = moonIcon;
                }
                 btn.setAttribute('aria-label', 'Switch to light theme');
            } else {
                 if (btn.classList.contains('btn-secondary')) {
                    btn.innerHTML = sunIcon + ' Theme';
                } else {
                     btn.innerHTML = sunIcon;
                }
                 btn.setAttribute('aria-label', 'Switch to dark theme');
            }
        });
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        htmlElement.removeAttribute('data-theme');
        updateThemeIcon('light');
         localStorage.setItem('theme', 'light');
    }

    themeToggleBtns.forEach(themeToggleBtn => {
        themeToggleBtn.addEventListener('click', function() {
            if (htmlElement.getAttribute('data-theme') === 'dark') {
                htmlElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                updateThemeIcon('light');
            } else {
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon('dark');
            }
        });
    });
}