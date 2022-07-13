# for nlp processing
import nltk

# for C-like arrays
import numpy as np 

# for stemming the words
from nltk.stem.porter import PorterStemmer

stemmer = PorterStemmer()

def tokenize(sentence):
	# standard tokens for english language
    return nltk.word_tokenize(sentence)

def stem(word):
	# convert all words to the root word
    return stemmer.stem(word.lower())



# with the help of tokenized sentences 
# and all tags the bag of words is created
def bag_of_words(tokenized_sentence, all_words):
    tokenized_sentence = set([stem(s) for s in tokenized_sentence])
    
    bag = np.zeros(len(all_words), dtype=np.float32)
    for i,j in enumerate(all_words):
        if j in tokenized_sentence:
            bag[i] = 1
    return bag