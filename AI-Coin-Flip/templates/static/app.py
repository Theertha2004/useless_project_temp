from flask import Flask, render_template, request, jsonify
from model import predict_coin

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    coin_type = data.get("coin_type")
    initial_side = data.get("initial_side")
    height = float(data.get("height"))
    force = float(data.get("force"))
    rotations = int(data.get("rotations"))

    result = predict_coin(
        coin_type,
        initial_side,
        height,
        force,
        rotations
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)