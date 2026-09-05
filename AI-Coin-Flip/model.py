import random


def predict_coin(coin_type, initial_side, height, force, rotations):
    """
    Experimental prediction model.

    A real coin toss is fundamentally difficult to predict
    without measuring the physical motion of the coin.
    This model is intentionally experimental.
    """

    # Start with equal probability
    heads_score = 50.0

    # Small experimental adjustments
    if initial_side == "Heads":
        heads_score += 3
    else:
        heads_score -= 3

    if force == "Low":
        heads_score += 1
    elif force == "High":
        heads_score -= 1

    if height < 30:
        heads_score += 1
    elif height > 70:
        heads_score -= 1

    if rotations % 2 == 0:
        heads_score += 1

    # Add a small random component
    heads_score += random.uniform(-5, 5)

    # Keep probability between 5 and 95
    heads_score = max(5, min(95, heads_score))

    tails_score = 100 - heads_score

    if heads_score >= tails_score:
        prediction = "Heads"
    else:
        prediction = "Tails"

    return {
        "prediction": prediction,
        "heads_probability": round(heads_score, 2),
        "tails_probability": round(tails_score, 2)
    }