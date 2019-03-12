import database as db
import music as m
from flask import Flask, jsonify, request
from flask_restful import Resource, Api, reqparse, abort
from os import environ

from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types

import spotipy
import spotipy.util as util
import spotipy.oauth2 as spauth

app = Flask(__name__)
app.config.from_envvar('ENV_VARS')
api = Api(app)


def get_results(annotations):
    score = annotations.document_sentiment.score
    magnitude = annotations.document_sentiment.magnitude
    # print("Overall Sentiment: score of {} with magnitude of {}".format(
    #     score, magnitude))
    return {'score': score, 'mag': magnitude}


def analyze(text):
    client = language.LanguageServiceClient()

    document = types.Document(
        content=text,
        type=enums.Document.Type.PLAIN_TEXT)
    annotations = client.analyze_sentiment(document=document)

    return get_results(annotations)


class User(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        username = json_data['user']
        new = db.get_user(username)
        return ({"newUser": new['isNew'], "mood": new['user'].current})


class MoodChange(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        mood = json_data['mood']
        username = json_data['user']
        user = db.get_user(username)['user']
        changed = db.change_mood(user, mood)
        return changed


class Preference(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        rating = json_data['rating']
        category = json_data['category']
        username = json_data['user']
        token = json_data['token']
        sp = spotipy.Spotify(auth=token)
        user = db.get_user(username)['user']
        return m.update_prefs(user, rating, category, sp)


class Textual(Resource):
    def post(self):
        # Retrieve JSON Data
        json_data = request.get_json(force=True)
        text = json_data['text']
        token = json_data['token']
        username = json_data['user']

        # Google Sentiment Results
        results = analyze(text)
        multiply = (10*results['score'])*(10*results['mag'])

        # Instantiate Spotify & User objects
        sp = spotipy.Spotify(auth=token)
        currUser = db.get_user(username)['user']
        # Return Songs to User Based on Mood
        if multiply < -80:
            mood = "negative"
        elif multiply > 80:
            mood = "positive"
        else:
            mood = "neutral"

        if currUser.current == mood:
            return ({"moodChanged": False, "data": m.get_songs(sp, currUser)})
        else:
            currUser.current = mood
            return ({"moodChanged": True, "data": m.get_songs(sp, currUser)})


# class Swap(Resource):
#     def post(self):
#         print("HEELLOOOO")
#         ratings_list = list(request.form.keys())[0].strip().split("\n")
#         print(ratings_list[0])
#         auth = spauth.SpotifyOAuth("b1482aa94ff644f7ac9be1b1cdf2f421",
#                                    "cf242ec9b3b44cc582a5f8258356aa67", "spotify-rn-tone-access://spotify-login-callback")
#         auth.get_access_token(ratings_list[0])
#         return {"token": "43krlsmdkaflsk"}


# class Refresh(Resource):
#     def post(self):
#         print("BBYYEYYEYEYE")
#         print(request.form.keys()[0])
#         # token = json_data['refresh_token']
#         return {"token": "43krlsmdkaflsk"}


# api.add_resource(Swap, '/swap')
# api.add_resource(Refresh, '/refresh')
api.add_resource(Textual, '/send')
api.add_resource(User, '/user')
api.add_resource(MoodChange, '/mood')
api.add_resource(Preference, '/update')

if __name__ == '__main__':
    app.run(debug=True)
    app.run()
