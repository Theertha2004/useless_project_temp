const predictButton =
    document.getElementById("predictButton");

const resultSection =
    document.getElementById("resultSection");

const prediction =
    document.getElementById("prediction");

const headsProbability =
    document.getElementById("headsProbability");

const tailsProbability =
    document.getElementById("tailsProbability");

const coin =
    document.getElementById("coin");

const accuracyMessage =
    document.getElementById("accuracyMessage");


predictButton.addEventListener("click", async function () {

    const data = {

        coin_type:
            document.getElementById("coinType").value,

        initial_side:
            document.getElementById("initialSide").value,

        height:
            document.getElementById("height").value,

        force:
            document.getElementById("force").value,

        rotations:
            document.getElementById("rotations").value

    };


    predictButton.innerText =
        "🧠 ANALYZING...";


    predictButton.disabled = true;


    try {

        const response =
            await fetch("/predict", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(data)

            });


        const result =
            await response.json();


        resultSection.classList.remove("hidden");


        prediction.innerText =
            result.prediction;


        headsProbability.innerText =
            result.heads_probability + "%";


        tailsProbability.innerText =
            result.tails_probability + "%";


        coin.style.transform =
            "rotateY(720deg)";


        setTimeout(() => {

            coin.style.transform =
                "rotateY(0deg)";

        }, 800);


    }

    catch (error) {

        alert(
            "Something went wrong. Please try again."
        );

        console.error(error);

    }


    predictButton.innerText =
        "🧠 ANALYZE FLIP";


    predictButton.disabled = false;

});


async function submitActualResult(actualResult) {

    const response =
        await fetch("/result", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                actual_result: actualResult
            })

        });


    const result =
        await response.json();


    if (result.success) {

        const predicted =
            prediction.innerText;


        if (predicted === actualResult) {

            accuracyMessage.innerText =
                "🏆 PREDICTION CORRECT! AI HAS ACHIEVED ABSOLUTELY NOTHING.";

        }

        else {

            accuracyMessage.innerText =
                "❌ PREDICTION FAILED. YOU COULD HAVE JUST USED A COIN.";

        }

    }

}