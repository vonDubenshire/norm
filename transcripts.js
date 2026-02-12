// ===================================
// Load Transcripts Data
// ===================================

async function loadTranscripts() {
    try {
        const response = await fetch('./transcripts.json');
        if (!response.ok) throw new Error('Failed to load transcripts');

        const transcripts = await response.json();

        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('total-transcripts').textContent = transcripts.length;
        renderTranscripts(transcripts);
    } catch (error) {
        console.error('Error loading transcripts:', error);
        showError();
    }
}

function renderTranscripts(transcripts) {
    const container = document.getElementById('transcripts-container');
    container.innerHTML = '';

    transcripts.forEach((transcript, index) => {
        const transcriptCard = createTranscriptCard(transcript, index);
        container.appendChild(transcriptCard);
    });
}

function createTranscriptCard(transcript, index) {
    const card = document.createElement('div');
    card.className = 'transcript-card';
    card.id = `transcript-${index}`;

    const header = document.createElement('div');
    header.className = 'transcript-header';

    const title = document.createElement('h2');
    title.className = 'transcript-title';
    title.textContent = transcript.title;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'transcript-toggle';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = `
        <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <span class="toggle-text">Show Transcript</span>
    `;

    header.appendChild(title);
    header.appendChild(toggleBtn);

    const content = document.createElement('div');
    content.className = 'transcript-content';
    content.style.display = 'none';

    const dialogue = document.createElement('div');
    dialogue.className = 'transcript-dialogue';

    transcript.content.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'dialogue-line';

        const speaker = document.createElement('div');
        speaker.className = 'speaker';
        speaker.textContent = line.speaker;

        const text = document.createElement('div');
        text.className = 'dialogue-text';
        text.textContent = line.text;

        lineDiv.appendChild(speaker);
        lineDiv.appendChild(text);
        dialogue.appendChild(lineDiv);
    });

    content.appendChild(dialogue);

    toggleBtn.addEventListener('click', () => {
        const isExpanded = content.style.display === 'block';
        content.style.display = isExpanded ? 'none' : 'block';
        toggleBtn.setAttribute('aria-expanded', !isExpanded);
        toggleBtn.querySelector('.toggle-text').textContent = isExpanded ? 'Show Transcript' : 'Hide Transcript';
        card.classList.toggle('expanded', !isExpanded);

        if (!isExpanded) {
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    });

    card.appendChild(header);
    card.appendChild(content);

    return card;
}

function showError() {
    const container = document.getElementById('transcripts-container');
    const loadingState = document.getElementById('loading-state');
    loadingState.style.display = 'none';
    container.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Failed to load transcripts</h3>
            <p>Please refresh the page to try again</p>
        </div>
    `;
    container.style.display = 'block';
}

// ===================================
// Initialize App
// ===================================

function init() {
    initTheme();
    initNav();
    loadTranscripts();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
