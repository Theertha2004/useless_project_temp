import random


def predict_coin(coin_type, initial_side, height, force, rotations):
    """
    Basic experimental prediction.
    This will later be replaced/upgraded with our ML model.
    """

    score = 0

    # Coin type
    if coin_type == "heavy":
        score += 1
    elif coin_type == "light":
        score -= 1

    # Initial side
    if initial_side == "heads":
        score += 1
    else:
        score -= 1

    # Flip height
    if height > 100:
        score += random.choice([-1, 0, 1])

    # Force
    if force > 50:
        score += random.choice([-1, 0, 1])

    # Rotation count
    if rotations % 2 == 0:
        score += 1
    else:
        score -= 1

    # Prediction
    if score > 0:
        prediction = "Heads"
    elif score < 0:
        prediction = "Tails"
    else:
        prediction = random.choice(["Heads", "Tails"])

    # Experimental probability
    heads_probability = random.randint(50, 75)
    tails_probability = 100 - heads_probability

    if prediction == "Tails":
        heads_probability, tails_probability = (
            tails_probability,
            heads_probability
        )

    return {
        "prediction": prediction,
        "heads_probability": heads_probability,
        "tails_probability": tails_probability
    }