const API_URL = 'https://lingva.ml/api/v1';
const MAX_TEXT_LENGTH = 2000;

const elements = {
    sourceText: document.getElementById('source-text'),
    translationResult: document.getElementById('translation-result'),
    translateBtn: document.getElementById('translate-btn'),
    copyBtn: document.getElementById('copy-btn'),
    swapBtn: document.getElementById('swap-languages'),
    sourceLanguage: document.getElementById('source-language'),
    targetLanguage: document.getElementById('target-language'),
    apiStatus: document.getElementById('api-status')
};

async function checkAPIStatus() {
    try {
        elements.apiStatus.textContent = 'Проверка подключения к API...';
        const response = await fetch(`${API_URL}/languages`);
        
        if (response.ok) {
            elements.apiStatus.textContent = 'API доступен';
            elements.apiStatus.style.color = 'green';
        } else {
            elements.apiStatus.textContent = 'API временно недоступен';
            elements.apiStatus.style.color = 'orange';
        }
    } catch (error) {
        elements.apiStatus.textContent = 'Не удалось подключиться к API';
        elements.apiStatus.style.color = 'red';
        console.error('API check failed:', error);
    }
}

async function translateText(text, sourceLang, targetLang) {
    if (!text.trim()) return '';
    
    if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(`Превышен лимит в ${MAX_TEXT_LENGTH} символов`);
    }

    try {
        const response = await fetch(
            `${API_URL}/${sourceLang === 'auto' ? 'auto' : sourceLang}/${targetLang}/${encodeURIComponent(text)}`
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка перевода');
        }
        
        const { translation } = await response.json();
        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

async function handleTranslation() {
    const text = elements.sourceText.value;
    const sourceLang = elements.sourceLanguage.value;
    const targetLang = elements.targetLanguage.value;
    
    if (!text.trim()) {
        elements.translationResult.textContent = 'Введите текст для перевода';
        elements.translationResult.removeAttribute('data-state');
        return;
    }
    
    try {
        elements.translationResult.textContent = 'Переводим...';
        elements.translationResult.setAttribute('data-state', 'loading');
        elements.translateBtn.disabled = true;
        
        const translation = await translateText(text, sourceLang, targetLang);
        elements.translationResult.textContent = translation;
        elements.translationResult.removeAttribute('data-state');
    } catch (error) {
        elements.translationResult.textContent = `Ошибка: ${error.message}`;
        elements.translationResult.setAttribute('data-state', 'error');
    } finally {
        elements.translateBtn.disabled = false;
    }
}

function handleCopy() {
    const text = elements.translationResult.textContent;
    if (!text || text === 'Перевод появится здесь...' || text.startsWith('Ошибка')) return;
    
    navigator.clipboard.writeText(text).then(() => {
        elements.copyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            elements.copyBtn.textContent = 'Копировать';
        }, 2000);
    });
}

function swapLanguages() {
    const temp = elements.sourceLanguage.value;
    elements.sourceLanguage.value = elements.targetLanguage.value === 'auto' ? 'en' : elements.targetLanguage.value;
    elements.targetLanguage.value = temp === 'auto' ? 'en' : temp;
    
    if (elements.sourceText.value.trim()) {
        handleTranslation();
    }
}

function init() {
    checkAPIStatus();
    
    elements.translateBtn.addEventListener('click', handleTranslation);
    elements.copyBtn.addEventListener('click', handleCopy);
    elements.swapBtn.addEventListener('click', swapLanguages);
    
    let typingTimer;
    elements.sourceText.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(handleTranslation, 1000);
    });
    
    elements.sourceText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleTranslation();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);