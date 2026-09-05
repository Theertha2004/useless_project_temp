// ==================================================
// ANIMALTALK AI - CUTE CARTOON TRANSLATOR SCRIPT
// ==================================================

// --------------------------------------------------
// GET HTML ELEMENTS
// --------------------------------------------------

const form = document.getElementById("translatorForm");
const inputSection = document.getElementById("inputSection");
const loadingSection = document.getElementById("loading");
const resultSection = document.getElementById("result");

const animalSelect = document.getElementById("animal");
const animalEmoji = document.getElementById("animalEmoji");
const detectedMood = document.getElementById("emotion");

const voiceStatus = document.getElementById("voiceStatus");
const voiceButton = document.getElementById("speakButton");
const voiceAnimation = document.getElementById("voiceAnimation");
const speakerIcon = document.getElementById("speakerIcon");

// --------------------------------------------------
// AUDIO VARIABLES
// --------------------------------------------------

let audioPlayer = null;
let voiceURL = null;

// Mascot map for animal select changes
const ANIMAL_ICONS = {
    dog: "🐶",
    cat: "🐱",
    bird: "🐦",
    cow: "🐮"
};

// --------------------------------------------------
// INITIAL LOG
// --------------------------------------------------

console.log("🐾 AnimalTalk AI (Cute Cartoon Theme) loaded!");

// --------------------------------------------------
// DYNAMIC ANIMAL SELECT UPDATE
// --------------------------------------------------

if (animalSelect) {
    animalSelect.addEventListener("change", function() {
        const selected = animalSelect.value;
        const icon = ANIMAL_ICONS[selected] || "🐾";
        console.log(`🐾 Selected pet switched to: ${selected} ${icon}`);
        
        // Update loading orb preview icon if present
        const orb = document.querySelector(".ai-orb");
        if (orb) {
            orb.textContent = icon;
        }
    });
}

// --------------------------------------------------
// FORM SUBMIT
// --------------------------------------------------

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    console.log("🎤 DECODE BUTTON CLICKED");

    // ----------------------------------------------
    // GET FORM DATA
    // ----------------------------------------------
    const formData = new FormData(form);
    const chosenAnimal = form.elements["animal"] ? form.elements["animal"].value : "dog";

    // Update loading screen text & icon for selected animal
    const orb = document.querySelector(".ai-orb");
    if (orb) {
        orb.textContent = ANIMAL_ICONS[chosenAnimal] || "🐾";
    }

    // ----------------------------------------------
    // SHOW LOADING
    // ----------------------------------------------
    inputSection.classList.add("hidden");
    loadingSection.classList.remove("hidden");
    resultSection.classList.add("hidden");

    try {
        console.log("📡 Sending pet sound to AI...");

        // ------------------------------------------
        // SEND TO BACKEND
        // ------------------------------------------
        const response = await fetch("/analyze", {
            method: "POST",
            body: formData
        });

        console.log("Server response status:", response.status);

        // ------------------------------------------
        // GET JSON
        // ------------------------------------------
        const data = await response.json();
        console.log("🤖 SERVER RESPONSE:", data);

        // ------------------------------------------
        // CHECK SUCCESS
        // ------------------------------------------
        if (!data.success) {
            console.error("Backend error:", data.error);
            alert(data.error || "Oops! Something went wonky. Please try again! 🐾");

            inputSection.classList.remove("hidden");
            loadingSection.classList.add("hidden");
            return;
        }

        // ------------------------------------------
        // SHOW ANIMAL
        // ------------------------------------------
        animalEmoji.textContent = data.emoji || ANIMAL_ICONS[chosenAnimal] || "🐾";

        // ------------------------------------------
        // SHOW DETECTED MOOD
        // ------------------------------------------
        detectedMood.textContent = data.result.emotion;

        // ------------------------------------------
        // GET VOICE URL
        // ------------------------------------------
        voiceURL = data.voice_url;
        console.log("🔊 Voice URL:", voiceURL);

        // ------------------------------------------
        // HIDE LOADING & SHOW RESULT
        // ------------------------------------------
        loadingSection.classList.add("hidden");
        resultSection.classList.remove("hidden");

        // ------------------------------------------
        // PLAY VOICE
        // ------------------------------------------
        if (voiceURL) {
            voiceStatus.textContent = "YOUR PET IS TALKING... 🔊🐾";
            setTimeout(function() {
                playAnimalVoice();
            }, 500);
        } else {
            voiceStatus.textContent = "VOICE GENERATION FAILED 😿";
            console.error("❌ No voice URL received");
        }

    } catch (error) {
        console.error("❌ JAVASCRIPT ERROR:", error);
        alert("Oops! The cartoon translator got tangled up. Check console for details!");

        inputSection.classList.remove("hidden");
        loadingSection.classList.add("hidden");
    }
});

// ==================================================
// PLAY ANIMAL VOICE
// ==================================================

function playAnimalVoice() {
    console.log("🔊 Playing pet voice...");

    if (!voiceURL) {
        console.error("❌ Voice URL does not exist");
        voiceStatus.textContent = "VOICE NOT AVAILABLE 😿";
        return;
    }

    // ----------------------------------------------
    // STOP PREVIOUS AUDIO
    // ----------------------------------------------
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }

    // ----------------------------------------------
    // CREATE AUDIO PLAYER
    // ----------------------------------------------
    audioPlayer = new Audio();
    audioPlayer.src = voiceURL;
    audioPlayer.volume = 1.0;
    audioPlayer.preload = "auto";

    console.log("🎵 Audio source:", audioPlayer.src);

    // ----------------------------------------------
    // AUDIO LOADED
    // ----------------------------------------------
    audioPlayer.addEventListener("loadeddata", function() {
        console.log("✅ Audio file loaded");
    });

    // ----------------------------------------------
    // AUDIO STARTED
    // ----------------------------------------------
    audioPlayer.addEventListener("play", function() {
        console.log("🔊 AUDIO PLAYING!");
        voiceStatus.textContent = "YOUR PET IS TALKING... 🔊🐾";
        if (speakerIcon) speakerIcon.textContent = "📻🎶";
        startVoiceAnimation();
    });

    // ----------------------------------------------
    // AUDIO FINISHED
    // ----------------------------------------------
    audioPlayer.addEventListener("ended", function() {
        console.log("✅ AUDIO FINISHED");
        voiceStatus.textContent = "TRANSLATION DELIVERED! 😂🐾";
        if (speakerIcon) speakerIcon.textContent = "📻✨";
        stopVoiceAnimation();
    });

    // ----------------------------------------------
    // AUDIO ERROR
    // ----------------------------------------------
    audioPlayer.addEventListener("error", function(event) {
        console.error("❌ AUDIO ERROR:", event);
        voiceStatus.textContent = "AUDIO PLAY ERROR 😿";
        if (speakerIcon) speakerIcon.textContent = "📻";
        stopVoiceAnimation();
    });

    // ----------------------------------------------
    // PLAY AUDIO WITH AUTOPLAY HANDLING
    // ----------------------------------------------
    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
        playPromise
            .then(function() {
                console.log("🎉 Malayalam voice playback started!");
            })
            .catch(function(error) {
                console.error("⚠️ AUTOPLAY BLOCKED:", error);
                voiceStatus.textContent = "CLICK 'PLAY AGAIN' TO HEAR! 🔊🐾";
                stopVoiceAnimation();
            });
    }
}

// ==================================================
// PLAY AGAIN BUTTON
// ==================================================

if (voiceButton) {
    voiceButton.addEventListener("click", function() {
        console.log("🔁 PLAY AGAIN clicked");
        playAnimalVoice();
    });
}

// ==================================================
// VOICE ANIMATION
// ==================================================

function startVoiceAnimation() {
    if (!voiceAnimation) return;
    const bars = voiceAnimation.querySelectorAll("span");
    bars.forEach(function(bar) {
        bar.classList.add("speaking");
    });
}

function stopVoiceAnimation() {
    if (!voiceAnimation) return;
    const bars = voiceAnimation.querySelectorAll("span");
    bars.forEach(function(bar) {
        bar.classList.remove("speaking");
    });
}