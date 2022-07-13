# frontend library for python 
from flask import Flask, render_template, url_for, request, jsonify
# response function from chat module
from chat import get_response


app = Flask(__name__)


# route to homepage
@app.route("/", methods=['GET', 'POST'])
def index():
    return render_template("index.html")


# handle prediction
@app.route("/predict", methods=['POST'])
def predict():
    text = request.get_json().get("message")
    return get_response(text)


# driver function
if __name__=='__main__':
	# start execution
    app.run(debug=True) 