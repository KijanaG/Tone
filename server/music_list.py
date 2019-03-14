import json


class MusicList:
    def __init__(self, mood):
        self.mood = mood
        self.genre_rank = []

    def sort(self):
        self.genre_rank.sort()

    def print_list(self):
        print(self.genre_rank)

    def reprJSON(self):
        return dict(genres=self.genre_rank)
