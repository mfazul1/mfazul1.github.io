document.addEventListener('DOMContentLoaded', function () {
    const showBtn = document.getElementById('show-btn');
    const submitBtn = document.getElementById('submit-btn');
    const subjectSelect = document.getElementById('subject-select');
    const classSelect = document.getElementById('class-select');
    const chapterSelect = document.getElementById('chapter-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const numQuestionsSelect = document.getElementById('num-questions-select');
    const scoreDisplay = document.getElementById('score-display');
    const finalScoreText = document.getElementById('final-score-text');
    const questionBox = document.getElementById('question-box');

    // Feedback modal elements
    const feedbackModal = document.getElementById('feedbackModal');
    const starRatingContainer = document.getElementById('star-rating');
    const feedbackTextarea = document.getElementById('feedbackText');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    let stars = []; // Declare stars here, populate on modal show

    const FEEDBACK_SESSION_KEY = 'feedbackRequestedThisSession';

    // Function to show a custom alert modal
    function showAlert(title, message) {
        $('#generalAlertModalLabel').text(title);
        $('#generalAlertModalBody').html(message);
        $('#generalAlertModal').modal('show');
    }

    let GROQ_API_KEY = '';
    let questionsData = [];
    let userAnswers = {};
    let chapterData = {};
    let selectedRating = 0; // To store the user's selected rating

    getSecret().then(key => {
        GROQ_API_KEY = key;
        // console.log("GROQ API Key loaded successfully."); // For debugging
    });

    fetch('https://api.npoint.io/aa477d0ba2e0d392f45f')
        .then(response => response.json())
        .then(data => chapterData = data)
        .catch(error => console.error('Error fetching chapter data:', error));

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

$(classSelect).niceSelect();
$(subjectSelect).niceSelect();
$(chapterSelect).niceSelect();

// Listen for real change events
$(classSelect).on('change', updateChapterSelect);
$(subjectSelect).on('change', updateChapterSelect);

    // Event listener for the "OK" button in the score modal to clear the score display and then show feedback modal
    $('#scoreModal').on('hidden.bs.modal', function () {
        scoreDisplay.innerHTML = ''; // Clear the inline score display
        finalScoreText.innerHTML = ''; // Clear the modal score
        // Check if feedback has already been requested/shown in this session
        if (feedbackModal && !sessionStorage.getItem(FEEDBACK_SESSION_KEY)) {
            $('#feedbackModal').modal('show');
            sessionStorage.setItem(FEEDBACK_SESSION_KEY, 'true'); // Set flag after showing
        }
    });

    // Event listener for when the feedback modal is shown
    $('#feedbackModal').on('shown.bs.modal', function () {
        // Re-initialize stars and event listeners when modal is shown
        if (starRatingContainer) {
            stars = starRatingContainer.querySelectorAll('.star');
            stars.forEach(star => {
                // Remove existing listeners to prevent duplicates
                star.removeEventListener('mouseover', handleMouseOver);
                star.removeEventListener('mouseout', handleMouseOut);
                star.removeEventListener('click', handleClick);

                // Add new listeners
                star.addEventListener('mouseover', handleMouseOver);
                star.addEventListener('mouseout', handleMouseOut);
                star.addEventListener('click', handleClick);
            });
            // Reset rating and highlight when modal is opened
            selectedRating = 0;
            highlightStars(0);
        }
    });

    // Event handlers for stars (defined outside to allow removeEventListener)
    function handleMouseOver(event) {
        highlightStars(event.target.dataset.value);
    }

    function handleMouseOut() {
        highlightStars(selectedRating);
    }

    function handleClick(event) {
        console.log('Star clicked:', event.target.dataset.value); // Added for debugging
        setRating(event.target.dataset.value);
    }

    function highlightStars(rating) {
        if (!stars.length) return; // Ensure stars are available
        stars.forEach(star => {
            if (star.dataset.value <= rating) {
                star.classList.add('rated');
            } else {
                star.classList.remove('rated');
            }
        });
    }

    function setRating(rating) {
        selectedRating = parseInt(rating);
        highlightStars(selectedRating);
    }

    // Feedback submission (only if submitFeedbackBtn exists)
    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', function() {
            const feedbackText = feedbackTextarea.value;
            const rating = selectedRating;

            if (rating === 0) {
                showAlert('Feedback Required', 'Please provide a rating before submitting.');
                return;
            }

            const now = new Date();
            const sessionId = now.getTime(); // Simple unique ID
            const date = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const time = now.toLocaleTimeString('en-CA', { hour12: false }); // HH:MM:SS
            const website = "jeeiitianbooks.in";

            // Placeholder AJAX call to a hypothetical Django backend endpoint
            $.ajax({
                url: 'https://archgpt.in/api/submit-feedback/', // Updated API URL

                // url: 'http://127.0.0.1:8000/api/submit-feedback/', // Updated API URL

                type: 'POST',
                contentType: 'application/json', // Assuming Django expects JSON
                dataType: 'json',
                data: JSON.stringify({
                    rating: rating,
                    comments: feedbackText,
                    sessionId: sessionId,
                    date: date,
                    time: time,
                    website: website
                }),
                success: function(response) {
                    if (response.success) {
                        showAlert('Feedback Submitted', 'Thank you for your feedback! It has been submitted successfully.');
                        sessionStorage.setItem(FEEDBACK_SESSION_KEY, 'true'); // Set flag on successful submission
                    } else {
                        // Display error message from the backend if available
                        showAlert('Feedback Submission Failed', 'Failed to submit feedback: ' + (response.message || 'Unknown error.'));
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    let errorMessage = 'Error submitting feedback. Please try again later.';
                    if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                        errorMessage += ' Details: ' + jqXHR.responseJSON.message;
                    } else {
                        errorMessage += ' Details: ' + textStatus + ' - ' + errorThrown;
                    }
                    showAlert('Error', errorMessage);
                    console.error('AJAX error:', textStatus, errorThrown, jqXHR);
                },
                complete: function() {
                    $('#feedbackModal').modal('hide');
                    feedbackTextarea.value = '';
                    selectedRating = 0;
                    highlightStars(0); // Reset stars
                }
            });
        });
    }


    async function fetchQuestions() {
        let subject = subjectSelect.value;
        const selectedClass = classSelect.value;
        const chapter = chapterSelect.value;
        const difficulty = difficultySelect.value;
        const numQuestions = numQuestionsSelect.value;


        if (selectedClass === 'Not selected' || subject === 'Not selected' || chapter === 'Not selected' || difficulty === 'Not selected' || numQuestions === 'Not selected') {
            showAlert('Selection Required', 'Please select all fields before proceeding.');
            return;
        }

        if (!GROQ_API_KEY) {
            showAlert('API Key Not Ready', 'API Key not loaded yet. Please wait a moment and try again.');
            return;
        }

        questionBox.innerHTML = 'Loading questions...';
        submitBtn.disabled = true;
        scoreDisplay.innerHTML = '';
        userAnswers = {};

        // Correct "Maths" to "Mathematics" for API consistency
        const apiSubject = (subject === 'Maths') ? 'Mathematics' : subject;

        const prompt = `Generate ${numQuestions} multiple-choice questions for ${selectedClass.replace('_', ' ')} on the chapter '${chapter}' from the subject ${apiSubject} for the JEE exam with ${difficulty} difficulty. Return the response as a valid JSON array where each object has 'question' (string), 'options' (an array of 4 strings), and 'answer' (the correct option string).`;

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

    function updateChapterSelect() {
        console.log('Updating chapter select options...');
        const selectedClass = classSelect.value;
        let selectedSubject = subjectSelect.value;

        chapterSelect.innerHTML = '<option>Not selected</option>';
        chapterSelect.disabled = true;

        // Handle the "Maths" vs "Mathematics" discrepancy
        const dataSubject = (selectedSubject === 'Maths') ? 'Mathematics' : selectedSubject;

        if (selectedClass !== 'Not selected' && selectedSubject !== 'Not selected' && chapterData[selectedClass] && chapterData[selectedClass][dataSubject]) {
            const chapters = chapterData[selectedClass][dataSubject];
            chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
            chapterSelect.disabled = false;
            $(chapterSelect).niceSelect('update'); // Refresh the nice-select dropdown
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