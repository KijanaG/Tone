import random as rand
import database as db

def get_songs(Spotify, User):
    new_songs  = []
    user_genre = User.mood[User.current].genre_rank[gen_pos()]
    genres     = user_genre.get_genres()
    cat        = user_genre.name
    for gen in genres:
        tracks = Spotify.recommendations(seed_genres=[gen], limit=20)
        for track in tracks['tracks']:
            obj        = {"cat": cat}
            obj["uri"] = track['uri']
            new_songs.append(obj)
    rand.shuffle(new_songs)
    return {"songs": new_songs[:20], "mood": User.current}


def update_prefs(User, rating, category, Spotify):
    music_list = User.mood[User.current]
    for x in music_list.genre_rank:
        if x.name == category:
            if rating > 3:
                x.rank = x.rank + rating
            elif rating == 2:
                x.rank = x.rank - 4
            elif rating == 1:
                x.rank = x.rank - 5
            else:
                x.rank = x.rank
    music_list.sort()
    db.write_updates(User)
    if rating < 3:
        return {"data": get_songs(Spotify, User), "change": True}
    else:
        return {"data": get_songs(Spotify, User), "change": False}


# Uses random probability to return one of the first
# five indices of the Music List genre arrays
def gen_pos():
    num = rand.uniform(0, 1)
    if   num < 0.5:
        return 0
    elif num < 0.7:
        return 1
    elif num < 0.9:
        return 2
    elif num < 0.95:
        return 3
    else:
        return 4
