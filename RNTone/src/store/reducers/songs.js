import * as actionTypes from '../actions/actionTypes';

const initialState = {
    currentMood: null,
    newUser: null,
    alert: false,
    songs: [],
    tempSongs: [],
    tempMood: null,
    category: null
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.NEWUSER:
            return {
                ...state,
                newUser: action.newUser,
                currentMood: action.currentMood
            }
        case actionTypes.SONGS:
            return {
                ...state,
                songs: state.songs.concat(action.songs)
            }
        case actionTypes.ALERT:
            return {
                ...state,
                alert: true
            }
        case actionTypes.CHANGE:
            if (action.change) {
                return {
                    ...state,
                    songs: state.tempSongs,
                    currentMood: state.tempMood,
                    alert: false
                }
            } else {
                return {
                    ...state,
                    alert: false,
                    tempMood: null,
                    tempSongs: []
                }
            }
        case actionTypes.TEMP:
            return {
                ...state,
                tempSongs: action.songs,
                tempMood: action.mood
            }
        case actionTypes.PRIMELIST:
            let cat = state.songs[0]['cat'];
            let songs = state.songs;
            let group = songs.splice(1);
            return {
                ...state,
                songs: group,
                category: cat
            }
        default:
            return state;
    }
}

export default reducer;