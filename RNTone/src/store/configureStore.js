import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import songsReducer from './reducers/songs';
import authReducer from './reducers/auth';

const rootReducer = combineReducers({
    songs: songsReducer,
    auth: authReducer
})

let composeEnhancers = compose;

if(__DEV__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const configureStore = () => {
    return createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
}

export default configureStore;