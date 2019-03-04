from flask import Flask, jsonify, request
from flask_restful import Resource, Api, reqparse, abort

from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types

import spotipy
import spotipy.util as util

app = Flask(__name__)
api = Api(app)


def get_results(annotations):
    score = annotations.document_sentiment.score
    magnitude = annotations.document_sentiment.magnitude

    # for index, sentence in enumerate(annotations.sentences):
    #     sentence_sentiment = sentence.sentiment.score
    #     print("Sentence {} has a sentiment score of {}".format(
    #         index, sentence_sentiment))

    # print("Overall Sentiment: score of {} with magnitude of {}".format(
    #     score, magnitude))
    return {'score': score, 'magnitude': magnitude}


def analyze(text):
    client = language.LanguageServiceClient()

    document = types.Document(
        content=text,
        type=enums.Document.Type.PLAIN_TEXT)
    annotations = client.analyze_sentiment(document=document)

    return get_results(annotations)


class Textual(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        text = json_data['text']
        token = json_data['token']
        id = json_data['id']
        results = analyze(text)
        print(results)
        print("-----------------\n")
        # print(token)
        sp = spotipy.Spotify(auth=token)
        #Get All Categories
        print(sp.recommendation_genre_seeds())
        cat = sp.categories(country="US", locale="en", limit="50")
        # for genre in cat['categories']['items']:
            # print("Genre: ",genre['id'])

        playlists = sp.user_playlists(id)
        # print(playlists)
        playlist = playlists['items'][0]
        # print(playlist['owner']['id'])
        # print(playlist['id'])
        # tracks = sp.user_playlist_tracks(id, playlist['id'], None, 2)
        # for track in tracks['items']:
        #     artist = sp.artist(track['track']['artists'][0]['id'])
        #     print(artist['genres'], "\n\n")

        print(sp.recommendations(seed_genres=["deep-house"]))
        # results = sp.user_playlist("spotify", "37i9dQZF1DX32NsLKyzScr", fields="tracks")
        # print(results['tracks']['items'][0]['track']['id'])
            # tracks = results['tracks']
            # print(tracks)
        # track = sp.track(results['tracks']['items'][0]['track']['id'])
        return ({'hello': "ManBun"}, 200)

    def get(self):
        # token = util.prompt_for_user_token(
        #     'conner.erickson.96@gmail.com',
        #     scope,
        #     client_id=SPOTIPY_CLIENT_ID,
        #     client_secret=SPOTIPY_CLIENT_SECRET,
        #     redirect_uri=SPOTIPY_REDIRECT_URI)
        # sp = spotipy.Spotify(auth=token)
        # print('helloo')
        return {'answers': 'true'}


api.add_resource(Textual, '/send', '/')

if __name__ == '__main__':
    app.run(debug=True)
    app.run()
