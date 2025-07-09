// Chat widget logic
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Save chat history to localStorage
function saveChatHistory() {
    localStorage.setItem("aj247_chat_history", chatLog.innerHTML);
}

// Load chat history from localStorage on page load
window.addEventListener("load", () => {
    const savedHistory = localStorage.getItem("aj247_chat_history");
    if (savedHistory) {
        chatLog.innerHTML = savedHistory;
    }
});

// Append message with optional typing effect and auto-scroll
function appendMessage(sender, message, options = {}) {
    const msgWrapper = document.createElement('div');
    msgWrapper.classList.add('chat-msg-wrapper', sender === 'You' ? 'right' : 'left');

    const metaDiv = document.createElement('div');
    metaDiv.classList.add('chat-msg-meta');

    const senderSpan = document.createElement('span');
    senderSpan.classList.add('chat-msg-sender');
    senderSpan.textContent = sender;

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('chat-msg-timestamp');
    const now = new Date();
    timeSpan.textContent = now.toLocaleTimeString('en-US', { hour12: false });

    metaDiv.appendChild(senderSpan);
    metaDiv.appendChild(timeSpan);

    const msgBubble = document.createElement('div');
    msgBubble.classList.add('chat-bubble', sender === 'You' ? 'user-bubble' : 'ai-bubble');

    const contentSpan = document.createElement('span');
    contentSpan.classList.add('chat-content');

    msgBubble.appendChild(contentSpan);
    msgWrapper.appendChild(metaDiv);
    msgWrapper.appendChild(msgBubble);
    chatLog.appendChild(msgWrapper);
    msgWrapper.scrollIntoView({ behavior: 'smooth' });

    if (options.typeEffect) {
        let i = 0;
        function typeChar() {
            if (i <= message.length) {
                contentSpan.innerHTML = message.slice(0, i).replace(/\n/g, "<br>");
                i++;
                setTimeout(typeChar, 2 + Math.random() * 5);
            } else {
                saveChatHistory();
            }
        }
        typeChar();
    } else {
        contentSpan.innerHTML = message.replace(/\n/g, "<br>");
        saveChatHistory();
    }
}

// Generate or get user id (new format)
function generateRandomUserId() {
    const id = "user_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("user_id", id);
    return id;
}

// Improved sendChatMessage with debounce, error logging, and cleaner UX
async function sendChatMessage() {
    if (!chatInput.value.trim() || chatSendBtn.disabled) return;

    const userMsg = chatInput.value.trim();
    appendMessage('You', userMsg);
    chatInput.value = '';
    chatSendBtn.disabled = true;
    chatInput.disabled = true;

    // Create and show typing indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'chat-msg-wrapper left';
    thinkingDiv.innerHTML = `
        <div class="chat-bubble ai-bubble">
            <span class="chat-content">Zoe is typing...</span>
        </div>`;
    chatLog.appendChild(thinkingDiv);
    thinkingDiv.scrollIntoView({ behavior: 'smooth' });

    // Animate dots
    let dot = 0;
    const dots = ['.', '..', '...', ''];
    const dotInterval = setInterval(() => {
        const bubble = thinkingDiv.querySelector('.chat-content');
        if (bubble) bubble.innerHTML = `Zoe is typing${dots[dot]}`;
        dot = (dot + 1) % dots.length;
    }, 400);

    try {
        const userId = localStorage.getItem("user_id") || generateRandomUserId();
        const payload = { message: userMsg, user_id: userId };
        const response = await fetch('https://salon-jonathan-flexibility-medicine.trycloudflare.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        localStorage.setItem("user_id", data.user_id || userId);

        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate delay

        clearInterval(dotInterval);
        chatLog.removeChild(thinkingDiv);
        appendMessage('Zoe', data.reply, { typeEffect: true });

    } catch (error) {
        console.error("❌ Zoe backend error:", error);
        clearInterval(dotInterval);
        chatLog.removeChild(thinkingDiv);
        appendMessage('Zoe', '⚠️ Sorry, I am offline or having trouble connecting.');
    } finally {
        chatSendBtn.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

// Shift+Enter = newline, Enter = send
chatInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await sendChatMessage();
    }
});

chatSendBtn.addEventListener('click', async () => {
    await sendChatMessage();
});

// Clear chat history
clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear your chat history?")) {
        chatLog.innerHTML = "";
        localStorage.removeItem("aj247_chat_history");
        localStorage.removeItem("user_id");
        appendMessage("Zoe", "🧹 Chat history cleared. Ready to start fresh!");
    }
});

// Close chat
document.getElementById("chat-close-btn").addEventListener("click", () => {
    chatContainer.classList.remove("active");
    document.body.classList.remove('lock-scroll'); // unlock scroll

    // Move toggle button back to body and make visible
    document.body.appendChild(toggleBtn);
    toggleBtn.style.position = '';
    toggleBtn.style.right = '';
    toggleBtn.style.bottom = '';
    toggleBtn.style.margin = '';
    toggleBtn.style.zIndex = '';
    toggleBtn.style.opacity = '1';
    toggleBtn.style.transform = 'scale(1)';
});
// Toggle chat
const toggleBtn = document.getElementById('chat-toggle-btn');
const chatContainer = document.getElementById('aj247-chat-container');
// Inside your toggle button click event listener
toggleBtn.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
    chatContainer.classList.toggle('active');

    if (chatContainer.classList.contains('active')) {
        document.body.classList.add('lock-scroll'); // lock scroll

        toggleBtn.style.opacity = '0';
        toggleBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            const chatInputBar = document.getElementById('chat-input-bar');
            chatInputBar.parentNode.insertBefore(toggleBtn, chatInputBar);
            toggleBtn.style.position = 'absolute';
            toggleBtn.style.right = '20px';
            toggleBtn.style.bottom = '100px';
            toggleBtn.style.margin = '';
            toggleBtn.style.zIndex = '10000';
            setTimeout(() => {
                toggleBtn.style.opacity = '1';
                toggleBtn.style.transform = 'scale(1)';
            }, 10);
        }, 200);
    } else {
        document.body.classList.remove('lock-scroll'); // unlock scroll

        toggleBtn.style.opacity = '0';
        toggleBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.appendChild(toggleBtn);
            toggleBtn.style.position = '';
            toggleBtn.style.margin = '';
            toggleBtn.style.right = '';
            toggleBtn.style.bottom = '';
            toggleBtn.style.zIndex = '';
            setTimeout(() => {
                toggleBtn.style.opacity = '1';
                toggleBtn.style.transform = 'scale(1)';
            }, 10);
        }, 200);
    }
});


// Mobile menu burger logic
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
hamburger.addEventListener('click', () => {
    if (chatContainer.classList.contains('active')) {
        chatContainer.classList.remove('active');
        toggleBtn.style.opacity = '0';
        toggleBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.appendChild(toggleBtn);
            toggleBtn.style.position = '';
            toggleBtn.style.margin = '';
            toggleBtn.style.right = '';
            toggleBtn.style.bottom = '';
            toggleBtn.style.zIndex = '';
            setTimeout(() => {
                toggleBtn.style.opacity = '1';
                toggleBtn.style.transform = 'scale(1)';
            }, 10);
        }, 200);
    }
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile nav menu on link click
const navLinks = navMenu.querySelectorAll('a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});
