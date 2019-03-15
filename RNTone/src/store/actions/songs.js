import * as actionTypes from './actionTypes';
import URL from '../../assets/url';
var url = URL.url;


export const verifyUser = () => {
    return async (dispatch, getState) => {
        const items = getState();
        let user = {
            user: items.auth.id
        }
        await fetch(url + "user", {
            method: 'POST',
            body: JSON.stringify(user)
        }).then(res => res.json())
            .then(parsedRes => {
                dispatch(updateMood(parsedRes))
            }).catch(err => {
                alert("Error\n", err.message)
            })
    }
}

export const sendText = (text) => {
    return async (dispatch, getState) => {
        const items = getState();
        const info = {
            text: text,
            token: items.auth.token,
            user: items.auth.id
        }
        await fetch(url + "send", {
            method: 'POST',
            body: JSON.stringify(info)
        }).then(res => res.json())
            .then(parsedRes => {
                if (parsedRes['moodChanged']) {
                    dispatch(temp(parsedRes['data']['songs'], parsedRes['data']['mood']));
                    dispatch(alert());
                } else if (items.songs.songs.length < 10) {
                    dispatch(addSongs(parsedRes['data']['songs']))
                }
            }).catch(err => {
                alert("Error\n", err.message);
            })
    }
}

export const updateMoodDB = () => {
    return async (dispatch, getState) => {
        const items = getState();
        const info = {
            mood: items.songs.currentMood,
            user: items.auth.id
        }
        await fetch(url + "mood", {
            method: "POST",
            body: JSON.stringify(info)
        }).then(res => res.json()).then(res => console.log("UPDATED ", res))
            .catch(err => alert("Error\n", err.message));
    }
}

export const updatePrefs = (rating) => {
    return async (dispatch, getState) => {
        const items = getState();
        const info = {
            rating: rating,
            user: items.auth.id,
            category: items.songs.category,
            token: items.auth.token
        }
        await fetch(url + "update", {
            method: "POST",
            body: JSON.stringify(info)
        }).then(res => res.json())
            .then(parsedRes => {
                if (parsedRes['change']) {
                    dispatch(temp(parsedRes['data']['songs'], items.songs.currentMood));
                    dispatch(alertChange(true));
                } else {
                    dispatch(addSongs(parsedRes['data']['songs']));
                }
            }).catch(err => alert("Error\n", err.message))
    }
}

export const setSongData = () => {
    return {
        type: actionTypes.PRIMELIST
    }
}

export const alertChange = (bool) => {
    return {
        type: actionTypes.CHANGE,
        change: bool
    }
}

const alert = () => {
    return {
        type: actionTypes.ALERT
    }
}


const updateMood = (res) => {
    return {
        type: actionTypes.NEWUSER,
        currentMood: res.mood,
        newUser: res.newUser
    }
}

const addSongs = (songs) => {
    return {
        type: actionTypes.SONGS,
        songs: songs
    }
}

const temp = (songs, mood) => {
    return {
        type: actionTypes.TEMP,
        songs: songs,
        mood: mood
    }
}