from flask import Flask, render_template, request, jsonify
import sqlite3

from model import predict_coin

app = Flask(__name__)

DATABASE = "coinflip.db"


def create_database():
    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS flips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coin_type TEXT,
            initial_side TEXT,
            height REAL,
            force TEXT,
            rotations INTEGER,
            prediction TEXT,
            actual_result TEXT
        )
    """)

    connection.commit()
    connection.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    coin_type = data["coin_type"]
    initial_side = data["initial_side"]
    height = float(data["height"])
    force = data["force"]
    rotations = int(data["rotations"])

    result = predict_coin(
        coin_type,
        initial_side,
        height,
        force,
        rotations
    )

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO flips
        (coin_type, initial_side, height, force, rotations, prediction)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        coin_type,
        initial_side,
        height,
        force,
        rotations,
        result["prediction"]
    ))

    connection.commit()
    connection.close()

    return jsonify(result)


@app.route("/result", methods=["POST"])
def save_result():
    data = request.get_json()

    actual_result = data["actual_result"]

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute("""
        UPDATE flips
        SET actual_result = ?
        WHERE id = (
            SELECT MAX(id)
            FROM flips
        )
    """, (actual_result,))

    connection.commit()
    connection.close()

    return jsonify({"success": True})


@app.route("/history")
def history():
    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM flips
        ORDER BY id DESC
        LIMIT 10
    """)

    rows = cursor.fetchall()

    connection.close()

    return jsonify(rows)


if __name__ == "__main__":
    create_database()

    app.run(debug=True)