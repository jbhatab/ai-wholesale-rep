from flask import Flask, request, jsonify
import openai
from pydantic import BaseModel, Field, ValidationError
from typing import List
import os 

app = Flask(__name__)

# Replace with your actual OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic Models for Data Validation
class OrderItem(BaseModel):
    item_name: str = Field(..., description="Name of the item")
    quantity: int = Field(..., gt=0, description="Quantity ordered")

class Order(BaseModel):
    customer_name: str = Field(..., description="Customer's full name")
    contact_number: str = Field(..., pattern=r"^\+?\d{10,15}$", description="Contact number in international format")
    items: List[OrderItem] = Field(..., description="List of items ordered")


# Flask Route for Chat Completions
@app.route("/chat/completions", methods=["POST"])
def chat_completions():
    # Step 1: Extract and validate incoming data using Pydantic
    data = request.get_json()

    if not data: 
        return jsonify({"error": "Invalid request. Data is missing."}), 400

    try:
        # Validate input data against the Pydantic schema
        order = Order(**data)
    except ValidationError as e:
        # Return validation errors to the client
        return jsonify({"error": e.errors()}), 400


    print(order)
    # Step 2: Call OpenAI API with conversation context or order details
    # try:
    #     response = openai.ChatCompletion.create(
    #         model="gpt-3.5-turbo-instruct",
    #         messages=[
    #             {"role": "system", "content": "You are a helpful assistant."},
    #             {"role": "user", "content": f"Process this order: {order.json()}"}
    #         ]
    #     )
    #     # Extract the assistant's response
    #     ai_response = response["choices"][0]["message"]["content"]
    # except Exception as e:
    #     # Handle OpenAI API errors
    #     return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500

    # Step 3: Return the validated data and AI response
    return jsonify({
        "validated_order": order.dict(),
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000) 
