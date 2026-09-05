from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import sys
import random
import librosa
import numpy as np
from gtts import gTTS

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
AUDIO_FOLDER = "generated_audio"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["AUDIO_FOLDER"] = AUDIO_FOLDER


# --------------------------------------------------
# ANIMAL EMOJIS
# --------------------------------------------------

ANIMAL_EMOJIS = {
    "dog": "🐶",
    "cat": "🐱",
    "bird": "🐦",
    "cow": "🐮"
}


# --------------------------------------------------
# FUNNY MALAYALAM DIALOGUES
# --------------------------------------------------

FUNNY_DIALOGUES = {

    "angry": [
        "ഇവിടെ ഞാൻ പറഞ്ഞത് ആരും കേൾക്കുന്നില്ലല്ലോ!",
        "ഇനി ഒരിക്കൽ കൂടി എന്റെ ഭക്ഷണം തൊട്ടാൽ തീർന്നു!",
        "എന്റെ ക്ഷമയ്ക്ക് ഒരു പരിധിയുണ്ട് കേട്ടോ!",
        "ഈ വീട്ടിൽ നിയമങ്ങൾ ഉണ്ടെന്ന് ആരെങ്കിലും ഇവരോട് പറയാമോ?",
        "എനിക്ക് ദേഷ്യം വന്നിട്ട് ഇത്ര നേരമായല്ലോ, ആരും ശ്രദ്ധിക്കുന്നില്ല!",
        "ആദ്യം എന്റെ ഭക്ഷണം കൊണ്ടുവാ, ബാക്കി കാര്യങ്ങൾ പിന്നെ സംസാരിക്കാം!",
        "ഇതെന്താ എന്നെ മാത്രം നോക്കി എല്ലാവരും നിൽക്കുന്നത്?",
        "ഞാൻ ശാന്തനാണ്... പക്ഷേ അധികനേരം അങ്ങനെ ആയിരിക്കില്ല!"
    ],

    "excited": [
        "അടിപൊളി! ഇന്ന് എന്തോ വലിയ സംഭവം നടക്കാൻ പോകുന്നു!",
        "എനിക്ക് ഇപ്പോൾ വളരെ സന്തോഷമാണ്! ഓടിക്കളിക്കാം!",
        "എന്താ നോക്കി നിൽക്കുന്നത്? പാർട്ടി തുടങ്ങിക്കഴിഞ്ഞു!",
        "ഇന്ന് ഞാൻ ഒന്നും ചെയ്യില്ല... വെറുതെ എല്ലാവരെയും ശല്യം ചെയ്യും!",
        "എനിക്ക് ഒരു ഐഡിയ കിട്ടി... പക്ഷേ അത് നല്ല ഐഡിയ ആണോ എന്ന് അറിയില്ല!",
        "എനിക്ക് എന്താണ് സംഭവിക്കുന്നതെന്ന് അറിയില്ല, പക്ഷേ ഞാൻ വളരെ എക്സൈറ്റഡാണ്!",
        "എല്ലാവരും തയ്യാറാകൂ! ഇന്ന് വീട്ടിൽ സമാധാനം ഉണ്ടാകില്ല!",
        "എനിക്ക് ഓടണം, കുരയ്ക്കണം, ചാടണം... എല്ലാം ഒരുമിച്ച് വേണം!"
    ],

    "sleepy": [
        "എന്നെ ഇപ്പോൾ വിളിക്കരുത്... ഞാൻ സ്വപ്നത്തിൽ ഭക്ഷണം കഴിക്കുകയാണ്.",
        "അഞ്ച് മിനിറ്റ് കൂടി ഉറങ്ങട്ടെ... പ്ലീസ്.",
        "ലോകത്തിലെ പ്രശ്നങ്ങൾ എല്ലാം നാളെ നോക്കാം.",
        "എനിക്ക് ഇപ്പോൾ ഒരു പ്രധാന മീറ്റിംഗ് ഉണ്ട്... ഉറക്കത്തിൽ.",
        "ഞാൻ കേൾക്കുന്നുണ്ട്... പക്ഷേ മറുപടി പറയാൻ മടി.",
        "ഇപ്പോൾ സംസാരിക്കാൻ പറ്റില്ല... എന്റെ ഉറക്കം വളരെ പ്രധാനപ്പെട്ടതാണ്.",
        "എന്നെ ഉണർത്തിയ ആളെ ഞാൻ പിന്നീട് അന്വേഷിക്കും.",
        "ജീവിതത്തിൽ ഏറ്റവും പ്രധാനപ്പെട്ട കാര്യം നല്ലൊരു ഉറക്കമാണ്."
    ],

    "scared": [
        "അയ്യോ! ആ സാധനം എന്നെ നോക്കുന്നുണ്ട്!",
        "എനിക്ക് എന്തോ പേടിയാകുന്നു... ആരെങ്കിലും ഇവിടെ വരാമോ?",
        "അവിടെ എന്തോ ഇളകി! ഞാൻ കണ്ടു!",
        "ഞാൻ ഒന്നും ചെയ്തിട്ടില്ല! എന്നെ കുറ്റപ്പെടുത്തരുത്!",
        "ആ ശബ്ദം എവിടെ നിന്നാണ് വന്നത്?!",
        "ഇവിടെ എന്തോ ശരിയല്ല... നമുക്ക് സ്ഥലം മാറാം.",
        "ഞാൻ ധൈര്യശാലിയാണ്... പക്ഷേ ഇപ്പോൾ കുറച്ച് പേടിയുണ്ട്.",
        "ആദ്യം നീ മുന്നോട്ട് പോ... ഞാൻ പിന്നിൽ സുരക്ഷിതമായി വരാം."
    ],

    "suspicious": [
        "നീ ഫ്രിഡ്ജിന്റെ അടുത്തേക്ക് എന്തിനാണ് പോയത്? ഞാൻ എല്ലാം കണ്ടു.",
        "നീ എന്താണ് ഒളിപ്പിക്കുന്നത്?",
        "എനിക്ക് എന്തോ സംശയമുണ്ട്... വളരെ വലിയ സംശയം.",
        "നിന്റെ പെരുമാറ്റം എനിക്ക് ഒട്ടും വിശ്വസിക്കാനാകുന്നില്ല.",
        "നീ എന്തിനാണ് ഇത്ര നേരം എന്നെ നോക്കുന്നത്?",
        "എന്തോ ഒരു പ്രശ്നമുണ്ട്... പക്ഷേ ആദ്യം ഞാൻ നിന്നെ നിരീക്ഷിക്കട്ടെ.",
        "എനിക്ക് എല്ലാം മനസ്സിലാകുന്നുണ്ട്. ഒന്നും ചോദിക്കേണ്ട.",
        "നീ ശാന്തനായിരിക്ക്... ഞാൻ നിന്നെ നിരീക്ഷിച്ചുകൊണ്ടിരിക്കുകയാണ്."
    ]
}


# --------------------------------------------------
# AUDIO ANALYSIS
# --------------------------------------------------

def analyze_audio(filepath):

    try:

        y, sr = librosa.load(
            filepath,
            sr=None,
            mono=True
        )

        duration = librosa.get_duration(
            y=y,
            sr=sr
        )

        rms = librosa.feature.rms(y=y)

        energy = float(
            np.mean(rms)
        )

        zcr = librosa.feature.zero_crossing_rate(y)

        zero_crossing = float(
            np.mean(zcr)
        )

        pitches, magnitudes = librosa.piptrack(
            y=y,
            sr=sr
        )

        pitch_values = []

        for i in range(pitches.shape[1]):

            index = magnitudes[:, i].argmax()

            pitch = pitches[index, i]

            if pitch > 0:
                pitch_values.append(pitch)

        if pitch_values:
            average_pitch = float(
                np.mean(pitch_values)
            )
        else:
            average_pitch = 0

        return {
            "duration": round(duration, 2),
            "energy": round(energy, 4),
            "zero_crossing": round(zero_crossing, 4),
            "pitch": round(average_pitch, 2)
        }

    except Exception as e:

        print("Audio analysis error:", e)

        return {
            "duration": 0,
            "energy": 0,
            "zero_crossing": 0,
            "pitch": 0
        }


# --------------------------------------------------
# MOOD DETECTION
# --------------------------------------------------

def detect_mood(features):

    energy = features["energy"]
    zcr = features["zero_crossing"]
    pitch = features["pitch"]

    if energy > 0.05 and zcr > 0.08:
        return "angry"

    elif energy > 0.05:
        return "excited"

    elif energy < 0.02:
        return "sleepy"

    elif pitch > 1000:
        return "scared"

    else:
        return "suspicious"


# --------------------------------------------------
# GENERATE INTERPRETATION
# --------------------------------------------------

def generate_interpretation(
    animal,
    context,
    features
):

    mood = detect_mood(features)

    dialogue = random.choice(
        FUNNY_DIALOGUES[mood]
    )

    confidence = random.randint(
        70,
        95
    )

    intents = {

        "angry":
            "The animal appears to be complaining 😂",

        "excited":
            "The animal seems extremely excited 🎉",

        "sleepy":
            "The animal desperately wants to sleep 😴",

        "scared":
            "The animal appears frightened 😨",

        "suspicious":
            "The animal seems suspicious of something 👀"
    }

    return {

        "emotion": mood,

        "intent":
            intents[mood],

        "malayalam":
            dialogue,

        "confidence":
            confidence
    }


# --------------------------------------------------
# GENERATE MALAYALAM VOICE
# --------------------------------------------------

def generate_voice(text):

    filename = (
        "animal_voice_"
        + str(random.randint(100000, 999999))
        + ".mp3"
    )

    filepath = os.path.join(
        app.config["AUDIO_FOLDER"],
        filename
    )

    try:

        print("Generating Malayalam voice...")

        tts = gTTS(
            text=text,
            lang="ml",
            slow=False
        )

        tts.save(filepath)

        print(
            "Voice generated:",
            filepath
        )

        return filename

    except Exception as e:

        print(
            "TTS ERROR:",
            e
        )

        return None


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# --------------------------------------------------
# TRANSLATOR
# --------------------------------------------------

@app.route("/translator")
def translator():

    return render_template(
        "translator.html"
    )


# --------------------------------------------------
# SERVE GENERATED AUDIO
# --------------------------------------------------

@app.route("/audio/<filename>")
def serve_audio(filename):

    return send_from_directory(
        app.config["AUDIO_FOLDER"],
        filename
    )


# --------------------------------------------------
# ANALYZE
# --------------------------------------------------

@app.route(
    "/analyze",
    methods=["POST"]
)
def analyze():

    try:

        if "audio" not in request.files:

            return jsonify({
                "success": False,
                "error":
                    "No audio file uploaded."
            }), 400

        audio_file = request.files["audio"]

        if audio_file.filename == "":

            return jsonify({
                "success": False,
                "error":
                    "Please select an audio file."
            }), 400

        animal = request.form.get(
            "animal",
            "dog"
        ).lower()

        context = request.form.get(
            "context",
            ""
        )

        filename = (
            str(random.randint(10000, 99999))
            + "_"
            + audio_file.filename.replace(
                " ",
                "_"
            )
        )

        filepath = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        audio_file.save(filepath)

        print("\n==============================")
        print("🐾 NEW ANIMAL SOUND")
        print("==============================")

        print("Animal:", animal)
        print("Context:", context)

        # Analyze
        features = analyze_audio(
            filepath
        )

        print(
            "Audio features:",
            features
        )

        # Interpret
        result = generate_interpretation(
            animal,
            context,
            features
        )

        print(
            "Detected mood:",
            result["emotion"]
        )

        print(
            "Malayalam:",
            result["malayalam"]
        )

        # Generate REAL MP3
        voice_file = generate_voice(
            result["malayalam"]
        )

        # Delete uploaded animal sound
        try:
            os.remove(filepath)
        except:
            pass

        if voice_file:

            voice_url = "/audio/" + voice_file

        else:

            voice_url = None

        print(
            "Voice URL:",
            voice_url
        )

        print("==============================\n")

        return jsonify({

            "success": True,

            "animal": animal,

            "emoji":
                ANIMAL_EMOJIS.get(
                    animal,
                    "🐾"
                ),

            "features": features,

            "result": result,

            "voice_url": voice_url

        })

    except Exception as e:

        print(
            "SERVER ERROR:",
            e
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# --------------------------------------------------
# TEST
# --------------------------------------------------

@app.route("/test")
def test():

    return jsonify({

        "status": "online",

        "message":
            "AnimalTalk AI is running! 🐾"

    })


# --------------------------------------------------
# START SERVER
# --------------------------------------------------

if __name__ == "__main__":

    print("")
    print("======================================")
    print("🐾 ANIMAL TALK AI")
    print("======================================")
    print("Server starting...")
    print("")
    print("Website:")
    print("http://127.0.0.1:5000")
    print("")
    print("Translator:")
    print("http://127.0.0.1:5000/translator")
    print("")
    print("======================================")
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )