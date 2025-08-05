const messages = [
    "",
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

const mandarin_messages = [
    "",
    "嘿, Z",
    "原谅我尝试创建3D场景",
    "我已经尽力了",
    "现在我把3D建模留给你 :)",
    "但除此之外",
    "我想祝你生日快乐",
    "我知道你不太庆祝生日",
    "但我想庆祝你",
    "你值得",
    "你是如此聪明、有趣、关心他人、可爱",
    "你值得世界上所有的爱",
    "你如此特别，这太疯狂了",
    "真的，你照亮了我的世界",
    "所以谢谢你",
    "无论如何，我感激你",
    "我希望你有一个美好的一天",
    "我希望你开始庆祝自己",
    "因为，天哪，你值得被庆祝",
    "",
    "生日快乐, Z <3"
];

const message = document.getElementById("message");
let currentMessageIndex = 0;
let selectedMessages = messages; // Default to English messages

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
            if (currentMessageIndex === selectedMessages.length - 1) {
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
        typeMessage(selectedMessages[currentMessageIndex], () => {
            if (currentMessageIndex < selectedMessages.length - 1) {
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
    const loadingCanvas = document.getElementById('loading');
    const engBut = document.getElementById('english');
    const manBut = document.getElementById('mandarin');
    const audio = document.getElementById("bg-music");
    
    function startAnimation() {
        audio.volume = 0.1;
        audio.play().catch(() => console.log("Autoplay blocked, waiting for user interaction."));
        
        languageChoice.style.transition = "opacity 2s ease-out";
        languageChoice.style.opacity = "0";
        
        loadingCanvas.style.transition = "opacity 8s ease-out";
        loadingCanvas.style.opacity = "0";
        
        setTimeout(() => {
            languageChoice.style.display = "none";
            loadingCanvas.style.display = "none";
            changeMessage();
        }, 8000);
    }

    engBut.addEventListener("click", () => {
        selectedMessages = messages;
        message.style.fontFamily = "'Varela Round', 'Amatic SC', 'Annie Use Your Telescope'"; // Default font
        startAnimation();
    });

    manBut.addEventListener("click", () => {
        selectedMessages = mandarin_messages;
        message.style.fontFamily = "'Chiron Hei HK', sans-serif"; // Chinese font
        startAnimation();
    });

});