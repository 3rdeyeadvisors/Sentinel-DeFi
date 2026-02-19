import random

def generate_stars(count):
    stars = []
    for _ in range(count):
        x = random.randint(0, 100)
        y = random.randint(0, 100)
        stars.append(f"{x}vw {y}vh #fff")
    return ", ".join(stars)

print("Layer 1 (100 stars):")
print(generate_stars(100))
print("\nLayer 2 (50 stars):")
print(generate_stars(50))
print("\nLayer 3 (25 stars):")
print(generate_stars(25))
