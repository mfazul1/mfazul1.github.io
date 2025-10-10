document.addEventListener('DOMContentLoaded', function () {
    const chatButton = document.getElementById('chat-button');
    const chatPopup = document.getElementById('chat-popup');
    const closeBtn = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

       // --- Knowledge Base ---
    // This is a simple AI based on keyword matching. 
    // For a true AI, you would integrate with a service like Google's Gemini or Dialogflow.
    const knowledgeBase = {
        "best book": "There is no single 'best' book, but highly recommended ones are HC Verma and I.E. Irodov for Physics, M.L. Khanna and Arihant for Mathematics, and J.D. Lee for Chemistry. You can find these and more on our BOOKS page.",
        "topper": "Toppers often recommend HC Verma for Physics, M.L. Khanna for Mathematics, and J.D. Lee for Chemistry. We have many of these available for free download.",
        "ncert": "NCERT books are crucial for Chemistry and helpful for Physics and Mathematics, but they are not sufficient on their own. You should supplement them with other reference books.",
        "math": "For Mathematics, many students use 'Objective Mathematics' by R.D. Sharma, 'Plane Trigonometry' by S.L. Loney, and books by Dr. S.K. Goyal (Arihant Publications).",
        "physics": "For Physics, 'Concepts of Physics' by H.C. Verma and 'Fundamentals of Physics' by Halliday, Resnick & Walker are excellent for building a strong conceptual foundation.",
        "chemistry": "'Organic Chemistry' by Paula Yurkanis Bruice and 'Concise Inorganic Chemistry' by J.D. Lee are highly regarded for Chemistry preparation.",
        "download": "Yes, all books on our website are available as downloadable PDFs. You can find them on the 'BOOKS' page. No registration is required!",
        "free": "Absolutely! All study materials and PDF books on this website are completely free to download.",
        "about": "JEE IITian BOOKS is a free platform dedicated to providing a vast collection of PDF books and study materials to help students prepare for JEE and IIT exams.",
        "what you get": "You get essential books, downloadable PDFs, and subject-specific e-books for Physics, Chemistry, and Mathematics. All for free and without registration.",
        "author": "This website was created by Mohammed Fazuluddin, an IT professional dedicated to helping JEE and IIT aspirants with innovative study tools.",
        "greeting": "Hello! I am your AI assistant. How can I help you with your JEE/IIT preparation today? You can ask me about the best books, how to download, or about the author.",
        "default": "I'm sorry, I'm not sure how to answer that. I can help with questions about the best books for JEE/IIT, how to download them, or information about this website. For more complex queries, you may need to consult a human expert."
    };

    // --- Chatbot Functions ---

    function toggleChat() {
        chatPopup.classList.toggle('show');
        if (chatPopup.classList.contains('show')) {
            addMessage('bot', knowledgeBase.greeting);
        }
    }

    function addMessage(sender, message) {
        const isTypingMessage = sender === 'bot' && message === '...';
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        if (isTypingMessage) {
            messageElement.classList.add('typing');
        }
        messageElement.innerHTML = message; // Use innerHTML to render links
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
        return messageElement; // Return the element to allow updating it
    }

    async function getBotResponse(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        // Prioritize greetings
        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            return knowledgeBase.greeting;
        }

        // Find the best match from the knowledge base
        let bestMatch = 'default';
        let highestScore = 0; // Start score at 0 to find any match

        for (const key in knowledgeBase) {
            if (key === 'greeting' || key === 'default') continue;

            const keywords = key.split(' ');
            let score = 0;
            keywords.forEach(keyword => {
                if (lowerInput.includes(keyword)) {
                    score++;
                }
            });

            if (score > highestScore) {
                highestScore = score;
                bestMatch = key;
            }
        }

        // If the score is high enough, return the local answer
        if (highestScore > 1) { // Require more than one keyword for a confident local match
            return knowledgeBase[bestMatch];
        }

     
    }

    async function handleUserInput() {
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        addMessage('user', userInput);
        chatInput.value = '';

        // Get response (which might be async)
        addMessage('bot', '...'); // Show typing indicator immediately
        const botResponse = await getBotResponse(userInput);
        const typingMessage = document.querySelector('.chat-message.bot.typing');
        if (typingMessage) typingMessage.remove(); // Remove typing indicator
        addMessage('bot', botResponse); // Add the final response
    }

    // --- Event Listeners ---

    chatButton.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });
});