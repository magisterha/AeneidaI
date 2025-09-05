document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICACIÓN INICIAL
    if (typeof corpus === 'undefined') {
        console.error("Error: El objeto 'corpus' no está definido. Asegúrate de que tu archivo de datos (ej: datos_verso1.js) se está cargando correctamente y antes que 'logica.js'.");
        return;
    }

    // 2. REFERENCIAS A ELEMENTOS DEL DOM
    const mainTitleElem = document.getElementById('main-title');
    const subtitleElem = document.getElementById('subtitle');
    const authorElem = document.getElementById('author');
    const contextTitleElem = document.getElementById('context-title');
    const contextContentElem = document.getElementById('context-content');
    const textTitleElem = document.getElementById('text-title');
    const paragrafusContentusElem = document.getElementById('paragrafus-contentus');
    const marginaliaContentusElem = document.getElementById('marginalia-contentus');
    const footerElem = document.getElementById('footer-text');
    const langSwitcher = document.getElementById('language-switcher');
    
    let currentLang = 'es';

    // =========================================================================================
    // === FUNCIONES DE RENDERIZADO ===
    // =========================================================================================

    function renderContent() {
        mainTitleElem.textContent = corpus.titulus_principalis;
        subtitleElem.textContent = corpus.titulus_secundarius[currentLang];
        authorElem.textContent = corpus.auctor;
        
        // La Eneida tiene versos, no capítulos. He adaptado la nomenclatura
        contextTitleElem.textContent = corpus.introductio[currentLang].titulus;
        contextContentElem.innerHTML = corpus.introductio[currentLang].contentus;
        
        textTitleElem.textContent = currentLang === 'es' ? 'Texto y Análisis' : (currentLang === 'en' ? 'Text and Analysis' : '文本與分析');
        
        buildLatinText();
        
        footerElem.textContent = `© ${new Date().getFullYear()} - Análisis Interactivo.`;
    }

    function buildLatinText() {
        paragrafusContentusElem.innerHTML = ''; 

        // Renombramos la variable 'capitulum' a 'versus' (verso) para mayor coherencia.
        corpus.textus.capitula.forEach((versus, versusIndex) => {
            const p = document.createElement('p');
            p.className = "mb-6 textum-classicum"; // Añadimos la clase para la tipografía
            p.innerHTML += `<span class="verse-number font-bold mr-2 text-gray-400">${versus.numerus}. </span>`; // Añadimos el número de verso
            
            // Renombramos la variable 'oratio' a 'sententia' para mayor claridad en el contexto de la poesía.
            versus.orationes.forEach((sententia, sententiaIndex) => {
                const words = sententia.original_lat.split(/(\s+)/);

                words.forEach(word => {
                    if (!word.trim()) {
                        p.appendChild(document.createTextNode(word));
                        return;
                    }
                    
                    const cleanWord = word.replace(/[,.;:]/g, '');
                    const verbumData = sententia.verba.find(v => v.textus.replace(/[,.;:]/g, '') === cleanWord);

                    if (verbumData) {
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.className = 'verbum';
                        span.dataset.versusIndex = versusIndex;
                        span.dataset.sententiaIndex = sententiaIndex;
                        span.dataset.verbumTextus = verbumData.textus;
                        p.appendChild(span);
                    } else {
                        p.appendChild(document.createTextNode(word));
                    }
                });
            });
            paragrafusContentusElem.appendChild(p);
        });
    }

    /**
     * Muestra el análisis de una palabra en la barra lateral.
     * @param {HTMLElement} clickedSpan - El elemento <span> de la palabra que fue clickeada.
     */
    function showAnalysis(clickedSpan) {
        // Adaptamos las variables de dataset
        const { versusIndex, sententiaIndex, verbumTextus } = clickedSpan.dataset;
        const sententiaData = corpus.textus.capitula[versusIndex].orationes[sententiaIndex];
        const verbumData = sententiaData.verba.find(v => v.textus.replace(/[,.;:]/g, '') === verbumTextus.replace(/[,.;:]/g, ''));

        if (!verbumData) return;

        const palabraTraducida = verbumData.translatio ? verbumData.translatio[currentLang] : 'N/A';
        const oratioTraducida = sententiaData.translationes[currentLang] || 'N/A';

        marginaliaContentusElem.innerHTML = `
            <div class="space-y-4">
                <div>
                    <p class="text-2xl textum-classicum text-gray-800 font-bold">${verbumData.textus}</p>
                    
                    <p class="text-lg text-blue-600 font-semibold mb-2">${palabraTraducida}</p> 

                    <p class="text-sm text-gray-600"><b>Lema:</b> <i>${verbumData.lemma}</i></p>
                    <p class="text-sm text-gray-600"><b>Morfología:</b> ${verbumData.morphologia}</p>
                    <p class="text-sm text-gray-600"><b>Sintaxis:</b> ${verbumData.syntaxis}</p>
                </div>
                <hr>
                <details open>
                    <summary class="font-semibold text-gray-700">Traducción del Verso</summary>
                    <div class="details-content mt-2 text-sm text-gray-700">
                        <p>${oratioTraducida}</p>
                    </div>
                </details>
                ${sententiaData.ordo_syntacticus ? `
                <details>
                    <summary class="font-semibold text-gray-700">Orden Sintáctico</summary>
                    <div class="details-content mt-2 text-sm text-gray-700">
                        <code>${sententiaData.ordo_syntacticus}</code>
                    </div>
                </details>` : ''}
                ${sententiaData.notae ? `
                <details>
                    <summary class="font-semibold text-gray-700">Notas Adicionales</summary>
                    <div class="details-content mt-2 text-sm text-gray-700">
                        <p>${sententiaData.notae}</p>
                    </div>
                </details>` : ''}
            </div>
        `;
    }

    // =========================================================================================
    // === MANEJADORES DE EVENTOS ===
    // =========================================================================================
    
    paragrafusContentusElem.addEventListener('click', (e) => {
        if (e.target.classList.contains('verbum')) {
            document.querySelectorAll('.verbum').forEach(el => el.classList.remove('activus'));
            e.target.classList.add('activus');
            showAnalysis(e.target);
        }
    });

    langSwitcher.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const newLang = e.target.dataset.lang;
            if (newLang !== currentLang) {
                currentLang = newLang;
                langSwitcher.querySelectorAll('.lang-btn').forEach(btn => {
                    btn.classList.toggle('active-lang', btn.dataset.lang === newLang);
                });
                renderContent();
                marginaliaContentusElem.innerHTML = '';
            }
        }
    });

    // =========================================================================================
    // === INICIALIZACIÓN ===
    // =========================================================================================
    renderContent();
});
