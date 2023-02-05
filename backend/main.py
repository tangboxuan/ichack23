import os 
from dotenv import load_dotenv
from newsapi import NewsApiClient
import json
import requests
from bs4 import BeautifulSoup
import boto3
import re
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import pandas as pd
import math
import sys

load_dotenv()
API_KEY = os.getenv("NEWSAPI_KEY")
ACCESS_KEY = os.getenv("ACCESS_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
newsapi = NewsApiClient(api_key=API_KEY)

aws_translate = boto3.client("translate", region_name="us-east-1", aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)

PAGE_SIZE = 100
# company = "字节跳动"
# company = "富士康"
company = "华为"
actually_get_articles = True
translate = True
storage = "articles.json"
translate_file = "translated.txt"
sentiment_word_list_file = "LoughranMcDonald_SentimentWordLists_2018.xlsx"

def getDictionaryFromXLSFile(XLSFile, ratings):
    wordlist = {}
    for i in range(1,8):
        frame = XLSFile.parse(XLSFile.sheet_names[i], header=None)
        frame.columns = ['word']
        frame['score'] = ratings[i - 1]
        dict =frame.set_index('word').to_dict()
        wordlist = {**wordlist, **dict} # append dictionary to wordlist
    return wordlist

def updateLexicon(sia):
    file = pd.ExcelFile(sentiment_word_list_file)
    wordlist = getDictionaryFromXLSFile(file, [-1,1,-1,-1,1,-1,-1]) # assign scores to words from financial lexiconn
    sia.lexicon.update(wordlist)

def inPassage(passage, list): 
    for word in list:
        if word in passage:
            return True 
    return False

def createColumn(df, columnName, list):
    df[columnName] = df['summary'].apply(inPassage, args=(list,))

eWords = {'environment', 'climate', 'sustainable', 'sustainability', 'green', 'planet'}
sWords = {'social','community', 'responsibility', 'philanthropy', 'charity'}
gWords = {'governance', 'board', 'administration', 'organization', 'conduct'}

def getSentimentScore(passage):
    try:
        score = sia.polarity_scores(passage)['compound']
    except TypeError:
        score = 0
    return score

def main(events,context):
    no_articles = 5
    translated = []
    if actually_get_articles:
        company_articles= newsapi.get_everything(q=company+" 不环保", language="zh", sort_by="relevancy")
        with open(storage, "w") as f:
            json.dump(company_articles, f)
    else:
        with open(storage, "r") as f:
            company_articles = json.load(f)
    if translate:
        urls = list(map(lambda x: x["url"], company_articles["articles"][0:no_articles]))
        for i in range(len(urls)):
            text = requests.get(urls[i]).text
            beautiful = BeautifulSoup(text, "html.parser").text
            beautiful = re.sub('[\n\r\ \t]','',beautiful).encode('utf-8')[0:10000].decode('utf-8', 'ignore')
            translated_elem = aws_translate.translate_text(Text=beautiful, SourceLanguageCode="zh", TargetLanguageCode="en")["TranslatedText"]
            translated.append(translated_elem)
            with open(str(i) + translate_file, "w") as f:
                f.write(translated_elem)
                print(translated_elem)
    else:
        for i in range(no_articles):
            with open(str(i) + translate_file, "r") as f:
                translated.append(f.read())

    nltk.download('vader_lexicon')
    sia = SentimentIntensityAnalyzer()
    updateLexicon(sia)
    escores = []
    sscores = []
    gscores = []
    for i in range(no_articles):
        article = translated[i]
        sentimentScore = getSentimentScore(article)

        if inPassage(article, eWords):
            escores.append(sentimentScore)
        if inPassage(article, sWords):
            sscores.append(sentimentScore)
        if inPassage(article, gWords):
            gscores.append(sentimentScore)
    etotal = sum(escores)/len(escores)
    stotal = sum(sscores)/len(sscores)
    gtotal = sum(gscores)/len(gscores)
    total = 2*((sum([etotal, stotal, gtotal])/3)-0.5)
    return {"etotal":etotal, "stotal": stotal, "gtotal":gtotal, "total":total}
