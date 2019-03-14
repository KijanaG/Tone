import json


class User:
    def __init__(self, id, current="neutral"):
        self.id = id
        self.mood = {}
        self.current = current

    def reprJSON(self):
        return dict(id=self.id, current=self.current, mood=self.mood)


class Encoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'reprJSON'):
            return obj.reprJSON()
        else:
            return json.JSONEncoder.default(self, obj)
