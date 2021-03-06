# to handle text data in json format
import json

# for nlp processing
from nltk_utils import tokenize, stem, bag_of_words

# for C-like arrays
import numpy as np

# for pytorch ML 
import torch

# provides neural network from pytorch
import torch.nn as nn

from torch.utils.data import Dataset, DataLoader
# NeuralNet from model module
from model import NeuralNet


# load json data
with open('intents.json', 'r') as f:
    intents = json.load(f)

all_words = []
tags = []
xy = []

for intent in intents['intents']:
    tag = intent['tag']
    tags.append(tag)
    
    for pattern in intent['patterns']:
        w = tokenize(pattern)
        all_words.extend(w)
        xy.append((w,tag))

# to avoid punctuation
ignore_words = set(['?', '!', '.', ','])

# apply stemmer on each word
all_words = [stem(w) for w in all_words if w not in ignore_words]

all_words = sorted(set(all_words))
tags = sorted(set(tags))

# initialize training data
X_train = []
y_train = []



# prepare labels and pattern's bag of words
for (pattern_sentence, tag) in xy:
    bag = bag_of_words(pattern_sentence, all_words)
    X_train.append(bag)
    
    label = tags.index(tag)
    y_train.append(label)

# convert to numpy array
X_train = np.array(X_train)
y_train = np.array(y_train)


# custom dataset class
class ChatDataset(Dataset):
    def __init__(self):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = y_train

    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    def __len__(self):
        return self.n_samples


#hyperparameters
batch_size = 8
hidden_size = 8
output_size = len(tags)
input_size = len(X_train[0])
learning_rate = 0.001

num_epochs = 1000


# initialize dataset
dataset = ChatDataset()
train_loader = DataLoader(dataset=dataset, batch_size=batch_size, shuffle=True, num_workers=2)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = NeuralNet(input_size, hidden_size, output_size).to(device)

#loss and optimizer

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

# training loop
for epoch in range(num_epochs):
    for (words, labels) in train_loader:
        words = words.to(device)
        labels = labels.to(device)

        #forward
        outputs = model(words)
        loss = criterion(outputs, labels)


        #backward and optimizer step

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    if (epoch+1)%100==0:
        print(f'epoch {epoch+1}/{num_epochs}, loss={loss.item():.4f}')

print(f'final loss, loss={loss.item():.4f}')

data = {
    "model_state": model.state_dict(),
    "input_size": input_size,
    "output_size": output_size,
    "hidden_size": hidden_size,
    "all_words": all_words,
    "tags": tags
}

FILE = "data.pth"
# saving the prepared model
torch.save(data, FILE)

print(f'training complete. file saved to {FILE}')