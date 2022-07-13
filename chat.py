# for random function to choose random response
import random
# to handle text data in json format
import json
# ML library
import torch

# NeuralNet from model module
from model import NeuralNet 

# for tokenization and classification
from nltk_utils import bag_of_words, tokenize


# check if gpu is available else just select cpu
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# load json data
with open('intents.json', 'r') as f:
    intents = json.load(f)

# path to pickled classification model
FILE = "data.pth"

# load the saved model 
data = torch.load(FILE)

# input layer size
input_size = data['input_size']
# hidden layer size
hidden_size = data['hidden_size']
# output layer size
output_size = data['output_size']

# pattern words in sorted order
all_words = data['all_words']

# store all classes
tags = data['tags']

# model state to save and load
model_state = data['model_state']

# loading the neural net to cpu or gpu
model = NeuralNet(input_size, hidden_size, output_size).to(device)

# save and load the whole model
model.load_state_dict(model_state)
model.eval()

bot_name="Alan"


def get_response(sentence):
    sentence = tokenize(sentence)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
	
    X = torch.from_numpy(X)

    output = model(X)
    _, predicted = torch.max(output, dim=1)
    tag = tags[predicted.item()]
	
	# storing probability of classes
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

	# if probability of a class is greater than 75 percent
	# return the matched tag
    if prob.item() > 0.75:

        for intent in intents['intents']:
            if tag==intent['tag']:
                return json.dumps({'tag': tag, 'message':random.choice(intent["responses"])})
    
    # default response when no match
    return json.dumps({'tag': 'unknown', 'message':"I don't understand.."})


if __name__=='__main__':
    while True:
        sentence = input('You: ')
        print(f'{bot_name}: {get_response(sentence)}')
