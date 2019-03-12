import copy

class GenreNode:
    def __init__(self, name, genres, rank):
        self.name = name
        self.genres = copy.deepcopy(genres)
        self.rank = rank

    def __eq__(self, other):
        return self.rank == other.rank

    def __ne__(self, other):
        return not (self == other)
    
    def __lt__(self, other):
        return self.rank > other.rank

    def reprJSON(self):
        return dict(name=self.name, rank=self.rank, genres=self.genres)

    def get_genres(self):
        return self.genres

    # def __repr__(self):
    #     return str(self.name)

    # def __del__(self):
    #     print("Deleting {}".format(self))
    