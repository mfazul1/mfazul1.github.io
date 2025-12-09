document.addEventListener('DOMContentLoaded', function () {
    const showBtn = document.getElementById('show-btn');
    const submitBtn = document.getElementById('submit-btn');
    const subjectSelect = document.getElementById('subject-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const numQuestionsSelect = document.getElementById('num-questions-select');
    const scoreDisplay = document.getElementById('score-display');
    const scoreModal = document.getElementById('scoreModal');
    const finalScoreText = document.getElementById('final-score-text');
    const questionBox = document.getElementById('question-box');

    let GROQ_API_KEY = '';
    let questionsData = [];
    let userAnswers = {};

    getSecret().then(key => {
        GROQ_API_KEY = key;
        // console.log("GROQ API Key loaded successfully."); // For debugging
    });

    async function getSecret() {
        try {
            const response = await fetch('https://api.npoint.io/e7926abb4dad1dfcc984');
            const data = await response.json();
            return data.groq_api_key;
        } catch (error) {
            console.error('Failed to fetch API key:', error);
            questionBox.innerHTML = 'Failed to load API configuration. Please contact the administrator.';
            return null;
        }
    }

    showBtn.addEventListener('click', fetchQuestions);
    submitBtn.addEventListener('click', handleSubmit);
    // Event listener for the "OK" button in the modal to clear the score display
    $('#scoreModal').on('hidden.bs.modal', function () {
        scoreDisplay.innerHTML = ''; // Clear the inline score display
        finalScoreText.innerHTML = ''; // Clear the modal score
    });

    async function fetchQuestions() {
        const subject = subjectSelect.value;
        const difficulty = difficultySelect.value;
        const numQuestions = numQuestionsSelect.value;

        if (subject === 'Not selected' || difficulty === 'Not selected' || numQuestions === 'Not selected') {
            alert('Please select a subject, difficulty level, and number of questions.');
            return;
        }

        if (!GROQ_API_KEY) {
            alert("API Key not loaded yet. Please wait a moment and try again.");
            return;
        }

        questionBox.innerHTML = 'Loading questions...';
        submitBtn.disabled = true;
        scoreDisplay.innerHTML = '';
        userAnswers = {};

        const prompt = `Generate ${numQuestions} multiple-choice questions on the subject of ${subject} with ${difficulty} difficulty for the JEE exam. Return the response as a valid JSON array where each object has 'question' (string), 'options' (an array of 4 strings), and 'answer' (the correct option string).`;

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: "You are an AI assistant that generates exam questions in JSON format."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'API request failed');
            }

            let content = data.choices[0]?.message?.content;
            // The API might wrap the JSON in a markdown block
            content = content.replace(/```json\n|```/g, '').trim();
            
            const parsedData = JSON.parse(content);
            questionsData = parsedData.questions || parsedData; // Handle if the array is nested under a 'questions' key
            renderQuestions();
        } catch (error) {
            console.error("Error calling Groq API:", error);
            questionBox.innerHTML = "Sorry, I couldn't fetch the questions. Please try again. If the problem persists, the API might be down.";
        }
    }

    function renderQuestions() {
        questionBox.innerHTML = '';
        questionsData.forEach((q, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';

            let optionsHTML = '';
            q.options.forEach(option => {
                optionsHTML += `
                    <label>
                        <input type="radio" name="q${index}" value="${option}">
                        ${option}
                    </label>
                `;
            });

            questionContainer.innerHTML = `
                <p><b>Q${index + 1}:</b> ${q.question}</p>
                <div class="options" id="options-q${index}">
                    ${optionsHTML}
                </div>
            `;
            questionBox.appendChild(questionContainer);
        });

        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', handleOptionChange);
        });
    }

    function handleOptionChange(event) {
        const questionIndex = event.target.name.replace('q', '');
        userAnswers[questionIndex] = event.target.value;

        if (Object.keys(userAnswers).length === questionsData.length) {
            submitBtn.disabled = false;
        }
    }

    function handleSubmit() {
        submitBtn.disabled = true;
        let score = 0;

        questionsData.forEach((q, index) => {
            const optionsContainer = document.getElementById(`options-q${index}`);
            const radioButtons = optionsContainer.querySelectorAll(`input[name="q${index}"]`);
            const userAnswer = userAnswers[index];

            radioButtons.forEach(radio => {
                radio.disabled = true;
                const label = radio.parentElement;

                if (radio.value === q.answer) {
                    label.classList.add('correct'); // Correct answer
                    if (radio.checked) {
                        score++;
                    }
                }

                if (radio.checked && radio.value !== q.answer) {
                    label.classList.add('incorrect'); // User's wrong choice
                }
            });
        });

        // Display the score
        finalScoreText.innerHTML = `Your score = ${score}/${questionsData.length}`;
        $('#scoreModal').modal('show'); // Show the Bootstrap modal
    }
});