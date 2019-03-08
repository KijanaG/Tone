import random as rand

def get_songs(Spotify, User):
    new_songs = []
    user_genre = User.mood[User.current].genre_rank[gen_pos()]
    genres = user_genre.get_genres()
    cat = user_genre.name
    for gen in genres:
        tracks = Spotify.recommendations(seed_genres=[gen], limit=20)
        for track in tracks['tracks']:
            obj = {"cat": cat}
            obj["uri"] = track['uri']
            new_songs.append(obj)
    rand.shuffle(new_songs)
    return {"songs":new_songs[:20], "mood":User.current}
    # playlists = Spotify.user_playlists(User.id)
    # for playlist in playlists['items']:
    #     id = playlist['id']
    #     tracks = Spotify.user_playlist_tracks(User.id, id, 
    #                     fields="items(track(id, artists))", limit=100)
    #     ###TRACK_ID### tracks['items'][0]['track']['id']
    #     for track in tracks['items']:
    #         try:
    #             artist_id = track['track']['artists'][0]['id']
    #             artist = Spotify.artist(artist_id)
    #             print(artist['genres'])
    #             if len(genres) > 0:
    #                 for gen in genres:
    #                     print(gen)
    #                 #     for x in user_genre:
    #                 #         if x in gen:
    #                 #             print("YESYES")
    #                 # print(track['track']['id'])
    #         except:
    #             continue
    # # GET FEATURED TRACKS
    # listss = sp.featured_playlists(locale="en", limit=50)
    # # print(listss['playlists']['items'])
    # for play in listss['playlists']['items']:
    #     # print(play['id'])
    #     tracks = sp.user_playlist_tracks(
    #         "spotify", play['id'], fields="items(track(id, artists))", limit=30)
    #     for track in tracks['items']:
    #         try:
    #             artist_id = track['track']['artists'][0]['id']
    #             artist = sp.artist(artist_id)
    #             print(artist['genres'])
    #         except:
    #             print("\n")

    # # results = sp.user_playlist("spotify", "37i9dQZF1DX32NsLKyzScr", fields="tracks")
    # # print(results['tracks']['items'][0]['track']['id'])
    # # tracks = results['tracks']
    # # print(tracks)
    # # track = sp.track(results['tracks']['items'][0]['track']['id'])


# Uses random probability to return one of the first 
# five indices of the Music List genre arrays
def gen_pos():
    num = rand.uniform(0,1)
    if   num < 0.5 : return 0
    elif num < 0.7 : return 1
    elif num < 0.9 : return 2
    elif num < 0.95: return 3
    else:            return 4