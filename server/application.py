import database as db
import music as m
import os
from flask import Flask, jsonify, request
from flask_restful import Resource, Api, reqparse, abort

from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types

import spotipy

application = Flask(__name__)
api = Api(application)

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'googlenlpcred.json'

def implicit():
    from google.cloud import storage
    storage_client = storage.Client()
    buckets = list(storage_client.list_buckets())
    print(buckets)

def get_results(annotations):
    score     = annotations.document_sentiment.score
    magnitude = annotations.document_sentiment.magnitude
    return {'score': score, 'mag': magnitude}


def analyze(text):
    client      = language.LanguageServiceClient()
    document    = types.Document(
        content = text,
        type    = enums.Document.Type.PLAIN_TEXT)
    annotations = client.analyze_sentiment(document=document)
    return get_results(annotations)


class User(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        username  = json_data['user']
        new       = db.get_user(username)
        return ({"newUser": new['isNew'], "mood": new['user'].current})


class MoodChange(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        mood      = json_data['mood']
        username  = json_data['user']
        user      = db.get_user(username)['user']
        changed   = db.change_mood(user, mood)
        return changed


class Preference(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        rating    = json_data['rating']
        category  = json_data['category']
        username  = json_data['user']
        token     = json_data['token']
        sp        = spotipy.Spotify(auth=token)
        user      = db.get_user(username)['user']
        return m.update_prefs(user, rating, category, sp)

# Receive voice data & distinguish whether or not mood has changed
# 
class Textual(Resource):
    def post(self):
# Retrieve JSON Data
        json_data = request.get_json(force=True)
        text      = json_data['text']
        token     = json_data['token']
        username  = json_data['user']
# Google Sentiment Results
        results   = analyze(text)
        multiply  = (10*results['score'])*(10*results['mag'])
# Instantiate Spotify & User objects
        sp        = spotipy.Spotify(auth=token)
        currUser  = db.get_user(username)['user']
# Return Songs to User Based on Mood
        if multiply   < -50:
            mood  = "negative"
        elif multiply >  50:
            mood  = "positive"
        else:
            mood  = "neutral"

        if currUser.current == mood:
            return ({"moodChanged": False, "data": m.get_songs(sp, currUser)})
        else:
            currUser.current = mood
            db.write_updates(currUser)
            return ({"moodChanged": True, "data": m.get_songs(sp, currUser)})

api.add_resource(Textual, '/send')
api.add_resource(User, '/user')
api.add_resource(MoodChange, '/mood')
api.add_resource(Preference, '/update')

if __name__ == '__main__':
    application.run(debug=False)
    application.run(host='0.0.0.0', port='8080')
