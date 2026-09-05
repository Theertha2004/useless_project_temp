// ==================================================
// ANIMALTALK AI - TRANSLATOR SCRIPT
// ==================================================


// --------------------------------------------------
// GET HTML ELEMENTS
// --------------------------------------------------

const form = document.getElementById("translatorForm");

const inputSection = document.getElementById("inputSection");
const loadingSection = document.getElementById("loading");
const resultSection = document.getElementById("result");

const animalEmoji = document.getElementById("animalEmoji");
const detectedMood = document.getElementById("emotion");

const voiceStatus = document.getElementById("voiceStatus");
const voiceButton = document.getElementById("speakButton");

const voiceAnimation =
    document.getElementById("voiceAnimation");


// --------------------------------------------------
// AUDIO VARIABLES
// --------------------------------------------------

let audioPlayer = null;
let voiceURL = null;


// --------------------------------------------------
// CHECK ELEMENTS
// --------------------------------------------------

console.log("🐾 AnimalTalk AI loaded");

console.log("Form:", form);
console.log("Input:", inputSection);
console.log("Loading:", loadingSection);
console.log("Result:", resultSection);
console.log("Mood:", detectedMood);
console.log("Voice button:", voiceButton);


// --------------------------------------------------
// FORM SUBMIT
// --------------------------------------------------

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    console.log("🎤 ANALYZE BUTTON CLICKED");


    // ----------------------------------------------
    // GET FORM DATA
    // ----------------------------------------------

    const formData = new FormData(form);


    // ----------------------------------------------
    // SHOW LOADING
    // ----------------------------------------------

    inputSection.classList.add("hidden");

    loadingSection.classList.remove("hidden");

    resultSection.classList.add("hidden");


    try {

        console.log("📡 Sending sound to Flask...");


        // ------------------------------------------
        // SEND TO BACKEND
        // ------------------------------------------

        const response = await fetch(
            "/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        console.log(
            "Server status:",
            response.status
        );


        // ------------------------------------------
        // GET JSON
        // ------------------------------------------

        const data = await response.json();


        console.log(
            "🤖 SERVER RESPONSE:",
            data
        );


        // ------------------------------------------
        // CHECK SUCCESS
        // ------------------------------------------

        if (!data.success) {

            console.error(
                "Backend error:",
                data.error
            );

            alert(
                data.error ||
                "Something went wrong."
            );

            inputSection.classList.remove(
                "hidden"
            );

            loadingSection.classList.add(
                "hidden"
            );

            return;
        }


        // ------------------------------------------
        // SHOW ANIMAL
        // ------------------------------------------

        animalEmoji.textContent =
            data.emoji || "🐾";


        // ------------------------------------------
        // SHOW DETECTED MOOD
        // ------------------------------------------

        detectedMood.textContent =
            data.result.emotion;


        // ------------------------------------------
        // GET VOICE URL
        // ------------------------------------------

        voiceURL = data.voice_url;


        console.log(
            "🔊 Voice URL:",
            voiceURL
        );


        // ------------------------------------------
        // HIDE LOADING
        // ------------------------------------------

        loadingSection.classList.add(
            "hidden"
        );


        // ------------------------------------------
        // SHOW RESULT
        // ------------------------------------------

        resultSection.classList.remove(
            "hidden"
        );


        // ------------------------------------------
        // PLAY VOICE
        // ------------------------------------------

        if (voiceURL) {

            voiceStatus.textContent =
                "YOUR ANIMAL IS SPEAKING... 🔊";


            // Give browser a moment to render
            setTimeout(
                function() {

                    playAnimalVoice();

                },
                500
            );

        } else {

            voiceStatus.textContent =
                "VOICE GENERATION FAILED 😭";

            console.error(
                "❌ No voice URL received"
            );
        }

    }


    // ----------------------------------------------
    // ERROR
    // ----------------------------------------------

    catch (error) {

        console.error(
            "❌ JAVASCRIPT ERROR:",
            error
        );

        alert(
            "Something went wrong. Check the VS Code terminal and browser console."
        );


        inputSection.classList.remove(
            "hidden"
        );

        loadingSection.classList.add(
            "hidden"
        );

    }

});


// ==================================================
// PLAY ANIMAL VOICE
// ==================================================

function playAnimalVoice() {

    console.log(
        "🔊 Trying to play voice..."
    );


    if (!voiceURL) {

        console.error(
            "❌ Voice URL does not exist"
        );

        voiceStatus.textContent =
            "VOICE NOT AVAILABLE 😭";

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


    console.log(
        "🎵 Audio source:",
        audioPlayer.src
    );


    // ----------------------------------------------
    // AUDIO LOADED
    // ----------------------------------------------

    audioPlayer.addEventListener(
        "loadeddata",
        function() {

            console.log(
                "✅ Audio file loaded"
            );

        }
    );


    // ----------------------------------------------
    // AUDIO STARTED
    // ----------------------------------------------

    audioPlayer.addEventListener(
        "play",
        function() {

            console.log(
                "🔊 AUDIO PLAYING!"
            );


            voiceStatus.textContent =
                "YOUR ANIMAL IS SPEAKING... 🔊";


            startVoiceAnimation();

        }
    );


    // ----------------------------------------------
    // AUDIO FINISHED
    // ----------------------------------------------

    audioPlayer.addEventListener(
        "ended",
        function() {

            console.log(
                "✅ AUDIO FINISHED"
            );


            voiceStatus.textContent =
                "TRANSLATION DELIVERED! 😂";


            stopVoiceAnimation();

        }
    );


    // ----------------------------------------------
    // AUDIO ERROR
    // ----------------------------------------------

    audioPlayer.addEventListener(
        "error",
        function(event) {

            console.error(
                "❌ AUDIO ERROR:",
                event
            );


            voiceStatus.textContent =
                "AUDIO ERROR 😭";


            stopVoiceAnimation();

        }
    );


    // ----------------------------------------------
    // PLAY AUDIO
    // ----------------------------------------------

    const playPromise =
        audioPlayer.play();


    if (playPromise !== undefined) {

        playPromise
            .then(function() {

                console.log(
                    "🎉 Malayalam voice started!"
                );

            })
            .catch(function(error) {

                console.error(
                    "⚠️ AUTOPLAY BLOCKED:",
                    error
                );


                voiceStatus.textContent =
                    "PRESS PLAY AGAIN 🔊";


                stopVoiceAnimation();

            });

    }

}


// ==================================================
// PLAY AGAIN BUTTON
// ==================================================

voiceButton.addEventListener(
    "click",
    function() {

        console.log(
            "🔁 PLAY AGAIN clicked"
        );


        playAnimalVoice();

    }
);


// ==================================================
// VOICE ANIMATION
// ==================================================

function startVoiceAnimation() {

    if (!voiceAnimation) {
        return;
    }


    const bars =
        voiceAnimation.querySelectorAll(
            "span"
        );


    bars.forEach(
        function(bar) {

            bar.classList.add(
                "speaking"
            );

        }
    );

}


// ==================================================
// STOP VOICE ANIMATION
// ==================================================

function stopVoiceAnimation() {

    if (!voiceAnimation) {
        return;
    }


    const bars =
        voiceAnimation.querySelectorAll(
            "span"
        );


    bars.forEach(
        function(bar) {

            bar.classList.remove(
                "speaking"
            );

        }
    );

}