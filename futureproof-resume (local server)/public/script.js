document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const cvForm = document.getElementById('cv-form');
    const inputSection = document.getElementById('input-section');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const aiOutputContainer = document.getElementById('ai-output-container');
    const backToHomeButton = document.getElementById('back-to-home');
    const cvFileTrigger = document.getElementById('cv-file-trigger');
    const cvFileInput = document.getElementById('cv-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const categoryCards = document.querySelectorAll('.category-card');
    const careerInterestInput = document.getElementById('career-interest');
    
    let currentTheme = localStorage.getItem('theme') || 'light';

    // --- FUNGSI-FUNGSI UTAMA ---

    // Fungsi untuk mengganti tema (Dark/Light Mode)
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    };

    // Fungsi untuk menampilkan hasil dari AI
    const displayResults = (htmlFromAI) => {
        const safeHtml = DOMPurify.sanitize(htmlFromAI, {
            ADD_CLASSES: ['score-display', 'ai-section', 'accordion-toggle', 'accordion-content', 'skill-cards-container', 'skill-card', 'copy-box', 'copy-btn'],
            ADD_ATTR: ['style'] 
        });
        aiOutputContainer.innerHTML = safeHtml;
        setupResultInteractions();
    };

    // Fungsi untuk interaksi di halaman hasil (accordion, copy)
    const setupResultInteractions = () => {
        const accordions = aiOutputContainer.querySelectorAll('.accordion-toggle');
        accordions.forEach(acc => {
            acc.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        });

        const copyButtons = aiOutputContainer.querySelectorAll('.copy-btn');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const textToCopy = this.previousElementSibling.textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 2000);
                });
            });
        });
    };

    // --- EVENT LISTENERS ---

    // Toggle Tema
    themeToggle.addEventListener('click', () => {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    // Pilihan kategori karir
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            careerInterestInput.value = card.dataset.category;
        });
    });

    // Tombol Upload File Custom
    cvFileTrigger.addEventListener('click', () => cvFileInput.click());
    cvFileInput.addEventListener('change', () => {
        if (cvFileInput.files.length > 0) {
            fileNameDisplay.textContent = cvFileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    // Pengiriman Form
    cvForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(cvForm);

        inputSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server error');
            }

            const data = await response.json();
            displayResults(data.analysis);
            resultsSection.classList.remove('hidden');

        } catch (error) {
            aiOutputContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            resultsSection.classList.remove('hidden');
        } finally {
            loadingSection.classList.add('hidden');
        }
    });

    // Tombol Kembali
    backToHomeButton.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        cvForm.reset();
        fileNameDisplay.textContent = '';
        categoryCards.forEach(c => c.classList.remove('active'));
    });

    applyTheme(currentTheme);
});