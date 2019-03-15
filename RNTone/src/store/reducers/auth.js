import * as actionTypes from '../actions/actionTypes';

const initialState = {
    isLoggedIn: false,
    id: null,
    token: null,
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.AUTHENTICATE:
            return {
                ...state,
                id: action.id,
                token: action.token,
                loading: false
            }
        case actionTypes.LOGIN:
            return {
                ...state,
                isLoggedIn: true
            }
        default:
        return state;
    }
}

export default reducer;