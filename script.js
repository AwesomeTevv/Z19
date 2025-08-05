const messages = [
    "",
    // "Hi",
    // "So I was kinda scared to do this",
    // "I thought you wouldn't like it",
    // "Or it would make you feel weird",
    // "And you still might",
    // "But then I realised",
    // "Today is about celebrating the people you care about",
    // "And telling them how much they mean to you",
    // "So I'm going to be selfish",
    // "Deal with it",
    // "This is my weird way of showing that you mean something to me",
    // "My life has been a lot more fun since you entered it",
    // "So thank you",
    // "If nothing else",
    // "I hope you know that you are appreciated",
    // "",
    // "Happy Valentine's Day"
    "Hey Z",
    "Forgive my attempt at creating a 3D scene",
    "I did my best",
    "For now I'll leave the 3D modelling to you :)",
    "But besides that",
    "I want to wish you a very happy birthday",
    "I know you don't really celebrate your birthday",
    "But I want to celebrate you",
    "You deserve it",
    "You are so smart, funny, caring, cute",
    "And you deserve all the love in the world",
    "You are so special it is crazy",
    "Genuinely, you have brightened up my world",
    "So thank you",
    "No matter what,I appreciate you",
    "I hope you have a incredible day",
    "And I hope you start celebrating yourself",
    "Because, my god, you deserve to be celebrated",
    "",
    "Happy Birthday, Z <3"
];

const message = document.getElementById("message");
let currentMessageIndex = 0;

let typingSpeed = 100; // Speed of typing effect
let deleteDelay = 1000; // Delay before deleting
let cursorBlinkSpeed = 500; // Cursor blink speed

// Function to type out the message with a blinking cursor
function typeMessage(text, callback) {
    let index = 0;
    message.innerHTML = ""; // Clear previous text

    function type() {
        if (index < text.length) {
            message.innerHTML = text.substring(0, index + 1) + '<span class="cursor">|</span>';
            index++;
            setTimeout(type, typingSpeed);
        } else {
            if (currentMessageIndex === messages.length - 1) {
                // If it's the last message, remove the cursor
                setTimeout(() => {
                    document.querySelector(".cursor").style.display = "none";
                    message.classList.add("move-up");
                }, deleteDelay);
            } else {
                setTimeout(callback, deleteDelay); // Wait before deleting
            }
        }
    }
    type();
}

// Function to delete the message before the next one
function deleteMessage(callback) {
    let text = message.innerText;
    let index = text.length;

    function erase() {
        if (index > 0) {
            message.innerHTML = text.substring(0, index - 1) + '<span class="cursor">|</span>';
            index--;
            setTimeout(erase, typingSpeed / 2);
        } else {
            callback(); // Start next message
        }
    }
    erase();
}

// Function to cycle through messages
function changeMessage() {
    message.style.opacity = 0; // Fade out effect

    setTimeout(() => {
        typeMessage(messages[currentMessageIndex], () => {
            if (currentMessageIndex < messages.length - 1) {
                setTimeout(() => {
                    deleteMessage(() => {
                        currentMessageIndex++;
                        changeMessage();
                    });
                }, deleteDelay);
            }
        });
        message.style.opacity = 1; // Fade in
    }, 500); // Adjust fade-out delay
}

document.addEventListener("DOMContentLoaded", () => {
    const languageChoice = document.getElementById('language-choice');
    const engBut = document.getElementById('english');
    const manBut = document.getElementById('mandarin');

    const audio = document.getElementById("bg-music");
    audio.volume = 0.1;

    function startAnimation() {

        audio.play().catch(() => console.log("Autoplay blocked, waiting for user interaction."));
        languageChoice.style.display = "none";
        changeMessage();
    }

    engBut.addEventListener("click", () => {
        startAnimation();
    });

    manBut.addEventListener("click", () => {
        startAnimation();
    });

});