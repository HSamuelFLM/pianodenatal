// ==================== SISTEMA DE AUTENTICAÇÃO ====================

// Verificar se usuário está logado
function checkAuth() {
    const loggedUser = localStorage.getItem('loggedUser');
    const authButtons = document.getElementById('authButtons');
    const userAvatar = document.getElementById('userAvatar');
    
    if (loggedUser) {
        // Usuário logado - mostrar avatar
        const user = JSON.parse(loggedUser);
        if (authButtons) authButtons.style.display = 'none';
        if (userAvatar) {
            userAvatar.style.display = 'flex';
            // Mostrar iniciais do nome
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const userInitials = document.getElementById('userInitials');
            if (userInitials) userInitials.textContent = initials;
        }
    } else {
        // Usuário não logado - mostrar botões
        if (authButtons) authButtons.style.display = 'flex';
        if (userAvatar) userAvatar.style.display = 'none';
    }
}

// Logout
function logout() {
    localStorage.removeItem('loggedUser');
    window.location.href = 'index.html';
}

// ==================== SISTEMA DO PIANO ====================

// Variáveis globais do piano
let currentSongIndex = 0;
let isPlaying = false;
let currentNoteInterval = null;
let repeatEnabled = false;
let audioContext = null;

// Dados das músicas
const songs = [
    {
        name: "Last Christmas",
        notes: ["C4", "D4", "E4", "E4", "D4", "C4", "B3", "C4", "C4", "D4", "E4", "E4", "D4", "D4", "C4"],
        duration: [500, 500, 1000, 500, 500, 500, 1000, 500, 500, 1000, 500, 500, 500, 1000, 2000]
    },
    {
        name: "Jingle Bells",
        notes: ["E4", "E4", "E4", "E4", "E4", "E4", "E4", "G4", "C4", "D4", "E4"],
        duration: [400, 400, 400, 400, 400, 400, 400, 400, 800, 800, 800]
    },
    {
        name: "We Wish You a Merry Christmas",
        notes: ["C4", "D4", "E4", "F4", "F4", "E4", "D4", "C4", "G3", "C4"],
        duration: [500, 500, 500, 1000, 500, 500, 500, 1000, 500, 2000]
    }
];

// Mapeamento de notas para frequências
const frequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'B3': 246.94, 'G3': 196.00
};

// Inicializar Audio Context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

// Tocar nota
function playNote(note) {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequencies[note] || 261.63;
    oscillator.type = 'sine';
    
    const volume = parseFloat(localStorage.getItem('volume') || '0.7');
    gainNode.gain.value = volume;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
    oscillator.stop(ctx.currentTime + 1);
    
    // Destacar tecla visualmente
    highlightKey(note);
}

// Destacar tecla
function highlightKey(note) {
    const keys = document.querySelectorAll('.piano-key');
    keys.forEach(key => {
        if (key.dataset.note === note) {
            key.style.backgroundColor = '#ffd700';
            key.style.transform = 'scale(0.95)';
            setTimeout(() => {
                key.style.backgroundColor = '';
                key.style.transform = '';
            }, 200);
        }
    });
}

// Criar teclas do piano
function createMiniPiano() {
    const pianoContainer = document.getElementById('miniPiano');
    if (!pianoContainer) return;
    
    const whiteKeys = [
        { note: 'C4', label: 'C' },
        { note: 'D4', label: 'D' },
        { note: 'E4', label: 'E' },
        { note: 'F4', label: 'F' },
        { note: 'G4', label: 'G' },
        { note: 'A4', label: 'A' },
        { note: 'B4', label: 'B' }
    ];
    
    pianoContainer.innerHTML = '';
    
    whiteKeys.forEach((key) => {
        const keyElement = document.createElement('div');
        keyElement.className = 'piano-key white';
        keyElement.dataset.note = key.note;
        keyElement.textContent = key.label;
        keyElement.addEventListener('click', () => playNote(key.note));
        pianoContainer.appendChild(keyElement);
    });
}

// Tocar música atual
function playCurrentSong() {
    if (currentNoteInterval) clearInterval(currentNoteInterval);
    
    const song = songs[currentSongIndex];
    if (!song) return;
    
    let noteIndex = 0;
    const speed = parseFloat(localStorage.getItem('speed') || '1');
    
    function playNextNote() {
        if (noteIndex >= song.notes.length) {
            if (repeatEnabled) {
                noteIndex = 0;
                playNextNote();
            } else {
                stopPlayback();
                isPlaying = false;
                const playBtn = document.getElementById('playBtn');
                if (playBtn) playBtn.textContent = '▶';
            }
            return;
        }
        
        playNote(song.notes[noteIndex]);
        const duration = song.duration[noteIndex] / speed;
        noteIndex++;
        currentNoteInterval = setTimeout(playNextNote, duration);
    }
    
    playNextNote();
    
    // Atualizar UI
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.textContent = '⏸';
}

// Parar reprodução
function stopPlayback() {
    if (currentNoteInterval) {
        clearTimeout(currentNoteInterval);
        currentNoteInterval = null;
    }
}

// Contar música para estatísticas
function countSongPlay() {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
        const user = JSON.parse(loggedUser);
        let plays = localStorage.getItem(`plays_${user.id}`) || 0;
        plays = parseInt(plays) + 1;
        localStorage.setItem(`plays_${user.id}`, plays);
        
        const songPlays = JSON.parse(localStorage.getItem(`songPlays_${user.id}`) || '{}');
        const currentSong = songs[currentSongIndex].name;
        songPlays[currentSong] = (songPlays[currentSong] || 0) + 1;
        localStorage.setItem(`songPlays_${user.id}`, JSON.stringify(songPlays));
    }
}

// ==================== EVENTOS E INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar autenticação
    checkAuth();
    
    // Adicionar evento de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Inicializar piano
    createMiniPiano();
    
    // Controles do player
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const speedSlider = document.getElementById('speedSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const repeatSwitch = document.getElementById('repeatSwitch');
    const songTabs = document.querySelectorAll('.song-tab');
    const currentSongTitle = document.getElementById('currentSongTitle');
    
    // Carregar configurações salvas
    if (speedSlider) {
        const savedSpeed = localStorage.getItem('speed');
        if (savedSpeed) speedSlider.value = savedSpeed;
        const speedValue = document.getElementById('speedValue');
        if (speedValue) speedValue.textContent = `${speedSlider.value}x`.replace('.', ',');
        
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            localStorage.setItem('speed', speed);
            if (speedValue) speedValue.textContent = `${speed}x`.replace('.', ',');
            if (isPlaying) {
                stopPlayback();
                playCurrentSong();
            }
        });
    }
    
    if (volumeSlider) {
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume) volumeSlider.value = savedVolume;
        const volumeValue = document.getElementById('volumeValue');
        if (volumeValue) volumeValue.textContent = `${Math.round(volumeSlider.value * 100)}%`;
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            localStorage.setItem('volume', volume);
            if (volumeValue) volumeValue.textContent = `${Math.round(volume * 100)}%`;
        });
    }
    
    if (repeatSwitch) {
        const savedRepeat = localStorage.getItem('repeat');
        if (savedRepeat === 'true') {
            repeatEnabled = true;
            repeatSwitch.style.backgroundColor = '#2e5c3e';
        }
        
        repeatSwitch.addEventListener('click', () => {
            repeatEnabled = !repeatEnabled;
            localStorage.setItem('repeat', repeatEnabled);
            repeatSwitch.style.backgroundColor = repeatEnabled ? '#2e5c3e' : '#ccc';
        });
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                stopPlayback();
                isPlaying = false;
                playBtn.textContent = '▶';
            } else {
                isPlaying = true;
                playCurrentSong();
                playBtn.textContent = '⏸';
                countSongPlay();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            updateSong();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            updateSong();
        });
    }
    
    function updateSong() {
        if (currentSongTitle) currentSongTitle.textContent = songs[currentSongIndex].name;
        
        songTabs.forEach((tab, index) => {
            if (index === currentSongIndex) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        if (isPlaying) {
            stopPlayback();
            playCurrentSong();
        }
    }
    
    songTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            currentSongIndex = index;
            updateSong();
        });
    });
    
    updateSong();
    
    // ==================== FORMULÁRIO DE CONTATO ====================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('contactName');
            const emailInput = document.getElementById('contactEmail');
            const messageTextarea = document.getElementById('message');
            
            const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messages.push({
                id: Date.now(),
                name: nameInput ? nameInput.value : 'Anônimo',
                email: emailInput ? emailInput.value : 'sem@email.com',
                message: messageTextarea ? messageTextarea.value : '',
                date: new Date().toISOString()
            });
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            alert('Mensagem enviada com sucesso!');
            contactForm.reset();
        });
    }
    
    // ==================== GALERIA LIGHTBOX ====================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    let currentImageIndex = 0;
    const totalImages = galleryItems.length;
    
    function openLightbox(index) {
        currentImageIndex = index;
        const imgSrc = galleryItems[index].querySelector('img').src;
        if (lightboxImg) lightboxImg.src = imgSrc;
        if (lightbox) lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        if (lightbox) lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        const imgSrc = galleryItems[currentImageIndex].querySelector('img').src;
        if (lightboxImg) lightboxImg.src = imgSrc;
    }
    
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % totalImages;
        const imgSrc = galleryItems[currentImageIndex].querySelector('img').src;
        if (lightboxImg) lightboxImg.src = imgSrc;
    }
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });
    
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtnLightbox = document.getElementById('lightboxPrev');
    const nextBtnLightbox = document.getElementById('lightboxNext');
    
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtnLightbox) prevBtnLightbox.addEventListener('click', prevImage);
    if (nextBtnLightbox) nextBtnLightbox.addEventListener('click', nextImage);
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    // ==================== NAVEGAÇÃO MOBILE ====================
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // ==================== TECLADO PARA PIANO ====================
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const keyMap = {
            'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
            'q': 'C5', 'w': 'D5', 'e': 'E5', 'r': 'F5', 't': 'G5', 'y': 'A5', 'u': 'B5'
        };
        
        if (keyMap[key]) {
            playNote(keyMap[key]);
            e.preventDefault();
        }
        
        if (key === ' ') {
            e.preventDefault();
            const playButton = document.getElementById('playBtn');
            if (playButton) playButton.click();
        }
    });
    
    // ==================== NEVE ====================
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄️';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
        snowflake.style.opacity = Math.random() * 0.5 + 0.2;
        snowflake.style.fontSize = Math.random() * 20 + 10 + 'px';
        snowflake.style.position = 'fixed';
        snowflake.style.top = '-20px';
        snowflake.style.zIndex = '9999';
        snowflake.style.pointerEvents = 'none';
        
        document.body.appendChild(snowflake);
        
        setTimeout(() => {
            snowflake.remove();
        }, 5000);
    }
    
    // Iniciar neve apenas se não estiver na página de auth
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
        setInterval(createSnowflake, 300);
    }
});
