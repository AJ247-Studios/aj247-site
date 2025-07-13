// Elements
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const toggleBtn = document.getElementById('chat-toggle-btn');
const chatContainer = document.getElementById('aj247-chat-container');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Save chat history
function saveChatHistory() {
    localStorage.setItem("aj247_chat_history", chatLog.innerHTML);
}

// Load chat history
window.addEventListener("load", () => {
    const savedHistory = localStorage.getItem("aj247_chat_history");
    if (savedHistory) chatLog.innerHTML = savedHistory;
});

// Append chat message
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
    timeSpan.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });

    metaDiv.append(senderSpan, timeSpan);

    const msgBubble = document.createElement('div');
    msgBubble.classList.add('chat-bubble', sender === 'You' ? 'user-bubble' : 'ai-bubble');

    const contentSpan = document.createElement('span');
    contentSpan.classList.add('chat-content');

    msgBubble.appendChild(contentSpan);
    msgWrapper.append(metaDiv, msgBubble);
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

// Generate user ID
function generateRandomUserId() {
    const id = "user_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("user_id", id);
    return id;
}

// Send chat message
async function sendChatMessage() {
    if (!chatInput.value.trim() || chatSendBtn.disabled) return;

    const userMsg = chatInput.value.trim();
    appendMessage('You', userMsg);
    chatInput.value = '';
    chatSendBtn.disabled = true;
    chatInput.disabled = true;

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'chat-msg-wrapper left';
    thinkingDiv.innerHTML = `
        <div class="chat-bubble ai-bubble">
            <span class="chat-content">Zoe is typing...</span>
        </div>`;
    chatLog.appendChild(thinkingDiv);
    thinkingDiv.scrollIntoView({ behavior: 'smooth' });

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
        const response = await fetch('https://installations-duplicate-classes-ip.trycloudflare.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        localStorage.setItem("user_id", data.user_id || userId);

        await new Promise(resolve => setTimeout(resolve, 700)); // Delay for UX

        clearInterval(dotInterval);
        chatLog.removeChild(thinkingDiv);
        appendMessage('Zoe', data.reply, { typeEffect: true });

    } catch (error) {
        console.error("❌ Zoe backend error:", error);
        clearInterval(dotInterval);
        chatLog.removeChild(thinkingDiv);
        appendMessage('Zoe', '⚠️ Sorry, I am currently offline or having trouble connecting. I might be getting updates or fixes — please try again shortly.');
    } finally {
        chatSendBtn.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

// Event listeners for chat input and buttons
chatInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await sendChatMessage();
    }
});
chatSendBtn.addEventListener('click', async () => {
    await sendChatMessage();
});
clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear your chat history?")) {
        chatLog.innerHTML = "";
        localStorage.removeItem("aj247_chat_history");
        localStorage.removeItem("user_id");
        appendMessage("Zoe", "🧹 Chat history cleared. Ready to start fresh!");
    }
});

// Chat close button
document.getElementById("chat-close-btn").addEventListener("click", () => {
    chatContainer.classList.remove("active");
    document.body.classList.remove('lock-scroll');

    // Reset toggle button styles & reattach to body
    document.body.appendChild(toggleBtn);
    toggleBtn.style.position = '';
    toggleBtn.style.right = '';
    toggleBtn.style.bottom = '';
    toggleBtn.style.margin = '';
    toggleBtn.style.zIndex = '';
    toggleBtn.style.opacity = '1';
    toggleBtn.style.transform = 'scale(1)';
});

// Chat toggle button
toggleBtn.addEventListener('click', () => {
    // Close mobile menu if open
    if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('lock-scroll');
    }

    chatContainer.classList.toggle('active');

    if (chatContainer.classList.contains('active')) {
        document.body.classList.add('lock-scroll');

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
        document.body.classList.remove('lock-scroll');

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
hamburger.addEventListener('click', () => {
    const menuIsOpen = navMenu.classList.contains('active');

    // Close chat if open
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

    if (!menuIsOpen) {
        document.body.classList.add('lock-scroll');  // Lock scroll on open
    } else {
        document.body.classList.remove('lock-scroll'); // Unlock on close
    }
});

// Close mobile menu when clicking nav links
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('lock-scroll');
    });
});

// Close mobile menu on click outside
document.addEventListener('click', (e) => {
    const clickedInsideMenu = navMenu.contains(e.target);
    const clickedHamburger = hamburger.contains(e.target);

    if (!clickedInsideMenu && !clickedHamburger && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('lock-scroll');

        // Restore chat toggle button if chat is closed
        if (!chatContainer.classList.contains('active')) {
            document.body.appendChild(toggleBtn);
            toggleBtn.style.position = '';
            toggleBtn.style.margin = '';
            toggleBtn.style.right = '';
            toggleBtn.style.bottom = '';
            toggleBtn.style.zIndex = '';
            toggleBtn.style.opacity = '1';
            toggleBtn.style.transform = 'scale(1)';
        }
    }
});

// Initial chat toggle button animation on load
window.addEventListener('load', () => {
    setTimeout(() => {
        toggleBtn.classList.add('show');
        setTimeout(() => {
            toggleBtn.classList.add('expand');
        }, 500);
    }, 1500);
});

// Initial fade-in animations for page elements
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }, 300);
});

// Category Filtering Logic
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        const selectedCategory = button.getAttribute('data-category');

        // Toggle active class on buttons
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show/hide packages
        document.querySelectorAll('.package-card').forEach(card => {
            const matches = card.classList.contains(selectedCategory);
            if (selectedCategory === 'all' || matches) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
