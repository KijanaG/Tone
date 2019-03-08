import random as rand
import json
import user as client
import genre_node as node
import music_list as ml


def get_user(username):
    try:    # Opening File
        with open("db/"+username+".json", "r") as js:
            parsed = json.load(js)
            data = json.loads(parsed)
            print(populate_user(data))
        return {"user": populate_user(data), "isNew": False}
    except:  # File does not exist
        with open("db/"+username+".json", "w") as file:
            curr_user = new_user(username)
            json.dump(get_json(curr_user), file)
        return {"user": curr_user, "isNew": True}


def new_user(username):
    newUser = client.User(username)
    with open("db/template.json") as temp:
        temp_data = json.load(temp)
        for mood in temp_data:
            cats = temp_data[mood]['categories']
            mlist = ml.MusicList(mood)
            ranks = [15, 5, 10, 5, 10, 5, 15, 5, 15, 10, 5]
            for x in cats:
                rand.shuffle(ranks)
                curr_node = node.GenreNode(x, cats[x], rank(ranks))
                mlist.genre_rank.append(curr_node)
            mlist.sort()
            newUser.mood[mood] = mlist
    return newUser


def rank(curr):
    return curr.pop(rand.randint(0, len(curr)-1))


def get_json(user):
    return client.Encoder().encode(user)


def populate_user(data):
    currUser = client.User(data['id'], data['current'])
    for mood in data['mood']:
        mlist = ml.MusicList(mood)
        for cat in data['mood'][mood]['genres']:
            curr_node = node.GenreNode(cat['name'], cat['genres'], cat['rank'])
            mlist.genre_rank.append(curr_node)
        mlist.sort()
        currUser.mood[mood] = mlist
    return currUser
