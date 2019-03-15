import * as actionTypes from './actionTypes';
import Spotify from 'rn-spotify-sdk';
import auth from '../../assets/spotifyAuth.json';

export const authenticate = () => {
    return async dispatch => {
        if(!await Spotify.isInitializedAsync()) {
            const spotifyOptions = {
                "clientID": auth.clientID,
                "sessionUserDefaultsKey": "SpotifySession",
                "redirectURL": auth.redirectURL,
                "scopes": [ "playlist-read-private", "streaming", "user-library-read", "user-read-email" ]
            };
            await Spotify.initialize(spotifyOptions);
        } else {
            if(await Spotify.isLoggedInAsync()) {
                dispatch(loggedIn());
            }
        }
    }
}

export const login = () => {
    return dispatch => {
        Spotify.login().then(res => {
            Spotify.getMe().then(response => {
                Spotify.getSessionAsync().then(res => {
                    dispatch(setGlobalData(response.id, res.accessToken));
                    dispatch(loggedIn());
                }).catch(err => {
                    alert("Error\n", err.message)
                })
            }).catch(err => {
                alert("Error\n", err.message)
            })
        }).catch(err => {
            alert("Error\n", err.message)
        })
    }
}

const loggedIn = () => {
    return {
        type: actionTypes.LOGIN
    }
}

const setGlobalData = (id, token) => {
    return {
        type: actionTypes.AUTHENTICATE,
        id: id, 
        token: token
    }
}
