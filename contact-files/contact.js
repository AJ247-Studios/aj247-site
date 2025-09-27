// Elements
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const toggleBtn = document.getElementById('chat-toggle-btn');
const chatContainer = document.getElementById('aj247-chat-container');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Email validation function
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

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

// FAQ accordion dropdown
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    item.classList.toggle("active");
  });
});

// Email validation before form submit
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-section form");
    const emailInput = document.getElementById("email");

    if (form && emailInput) {
        form.addEventListener("submit", (e) => {
            if (!isValidEmail(emailInput.value)) {
                e.preventDefault(); // stop form from submitting
                alert("⚠️ Please enter a valid email address.");
                emailInput.focus();
            }
        });
    }
});

// Add these enhanced functions to your contact.js file

// Character counter for textarea
function addCharacterCounter() {
    const messageField = document.getElementById("message");
    if (messageField) {
        const counter = document.createElement("div");
        counter.className = "char-counter";
        counter.id = "char-counter";
        messageField.parentNode.insertBefore(counter, messageField.nextSibling);

        function updateCounter() {
            const current = messageField.value.length;
            const max = 1000; // Set maximum character limit
            counter.textContent = `${current}/${max} characters`;

            // Update counter styling based on length
            counter.classList.remove("warning", "error");
            if (current > max * 0.9) {
                counter.classList.add("warning");
            }
            if (current > max) {
                counter.classList.add("error");
            }
        }

        messageField.addEventListener("input", updateCounter);
        updateCounter(); // Initialize counter
    }
}

// Enhanced form submission with better UX
function enhanceFormSubmission() {
    const form = document.querySelector(".contact-section form");
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (form && submitBtn) {
        const originalText = submitBtn.textContent;

        form.addEventListener("submit", (e) => {
            // Add loading state
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";
            submitBtn.style.position = "relative";

            // Show success message after delay (simulate processing)
            setTimeout(() => {
                // Reset button after successful submission
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.position = "";
            }, 3000);
        });
    }
}

// Form field validation with visual feedback
function addVisualValidation() {
    const form = document.querySelector(".contact-section form");
    if (!form) return;

    const fields = form.querySelectorAll("input, textarea");
    
    fields.forEach(field => {
        // Real-time validation on input
        field.addEventListener("input", () => {
            validateField(field);
        });

        // Validation on blur
        field.addEventListener("blur", () => {
            validateField(field);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Clear previous styling
    field.style.borderColor = "";
    field.style.boxShadow = "";
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
        existingError.remove();
    }

    if (field.hasAttribute("required") && !value) {
        isValid = false;
        errorMessage = "This field is required";
    } else if (field.type === "email" && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = "Please enter a valid email address";
    } else if (field.id === "name" && value && value.length < 2) {
        isValid = false;
        errorMessage = "Name must be at least 2 characters";
    } else if (field.id === "message" && value && value.length < 10) {
        isValid = false;
        errorMessage = "Message must be at least 10 characters";
    }

    // Apply visual feedback
    if (!isValid && value) { // Only show error if field has content
        field.style.borderColor = "#e74c3c";
        field.style.boxShadow = "0 0 0 2px rgba(231, 76, 60, 0.2)";
        
        // Add error message
        const errorDiv = document.createElement("div");
        errorDiv.className = "field-error";
        errorDiv.style.color = "#e74c3c";
        errorDiv.style.fontSize = "0.8rem";
        errorDiv.style.marginTop = "-1rem";
        errorDiv.style.marginBottom = "1rem";
        errorDiv.textContent = errorMessage;
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    } else if (isValid && value) {
        field.style.borderColor = "#27ae60";
        field.style.boxShadow = "0 0 0 2px rgba(39, 174, 96, 0.2)";
    }

    return isValid;
}

// Auto-resize textarea
function addTextareaAutoResize() {
    const textarea = document.getElementById("message");
    if (textarea) {
        textarea.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
        });
    }
}

// Form analytics (track form interactions)
function trackFormInteractions() {
    const form = document.querySelector(".contact-section form");
    if (!form) return;

    const fields = form.querySelectorAll("input, textarea");
    let formStartTime = null;

    fields.forEach(field => {
        field.addEventListener("focus", () => {
            if (!formStartTime) {
                formStartTime = Date.now();
            }
        });
    });

    form.addEventListener("submit", () => {
        if (formStartTime) {
            const timeSpent = Math.round((Date.now() - formStartTime) / 1000);
            console.log(`Form completed in ${timeSpent} seconds`);
            // You could send this to analytics if needed
        }
    });
}

// Initialize all enhancements
document.addEventListener("DOMContentLoaded", () => {
    addCharacterCounter();
    enhanceFormSubmission();
    addVisualValidation();
    addTextareaAutoResize();
    trackFormInteractions();
    
    // Focus first field for better UX
    const firstField = document.getElementById("name");
    if (firstField) {
        setTimeout(() => firstField.focus(), 100);
    }
});

// Prevent form resubmission on page refresh
window.addEventListener("beforeunload", () => {
    const form = document.querySelector(".contact-section form");
    const submitBtn = form?.querySelector('button[type="submit"]');
    
    if (submitBtn && submitBtn.disabled) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
    }
});