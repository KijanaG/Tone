import random as rand
import json
import user as client
import genre_node as node
import music_list as ml


def get_user(username):
# Opening File
    try:
        with open("db/"+username+".json", "r") as js:
            parsed = json.load(js)
            data = json.loads(parsed)
        return {"user": populate_user(data), "isNew": False}
# File does not exist
    except:
        with open("db/"+username+".json", "w") as file:
            curr_user = new_user(username)
            json.dump(get_json(curr_user), file)
        return {"user": curr_user, "isNew": True}


def new_user(username):
    newUser = client.User(username)
    with open("db/template.json") as temp:
        temp_data = json.load(temp)
        for mood in temp_data:
            cats  = temp_data[mood]['categories']
            mlist = ml.MusicList(mood)
            ranks = [15, 5, 10, 5, 10, 5, 15, 5, 15, 10, 5]
            for x in cats:
                rand.shuffle(ranks)
                curr_node = node.GenreNode(x, cats[x], rank(ranks))
                mlist.genre_rank.append(curr_node)
            mlist.sort()
            newUser.mood[mood] = mlist
    return newUser


def change_mood(User, mood):
    if User.current == mood:
        return False
    User.current = mood
    return write_updates(User)


def write_updates(User):
    try:
        with open("db/"+User.id+".json", "w") as file:
            json.dump(get_json(User), file)
            return True
    except:
        return False


def rank(curr):
    return curr.pop(rand.randint(0, len(curr)-1))


def get_json(User):
    return client.Encoder().encode(User)


def populate_user(data):
    curr_user = client.User(data['id'], data['current'])
    for mood in data['mood']:
        mlist = ml.MusicList(mood)
        for cat in data['mood'][mood]['genres']:
            curr_node = node.GenreNode(cat['name'], cat['genres'], cat['rank'])
            mlist.genre_rank.append(curr_node)
        mlist.sort()
        curr_user.mood[mood] = mlist
    return curr_user
