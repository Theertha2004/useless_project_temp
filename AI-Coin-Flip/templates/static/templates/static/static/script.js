const predictButton = document.getElementById("predictButton");

const resultSection = document.getElementById("resultSection");

const prediction = document.getElementById("prediction");

const headsProbability =
    document.getElementById("headsProbability");

const tailsProbability =
    document.getElementById("tailsProbability");


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


    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });


        const result = await response.json();


        prediction.textContent =
            result.prediction;


        headsProbability.textContent =
            result.heads_probability;


        tailsProbability.textContent =
            result.tails_probability;


        resultSection.classList.remove("hidden");

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong!");

    }

});