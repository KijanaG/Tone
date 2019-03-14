import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableHighlight, Alert, Dimensions } from 'react-native';
import Spotify from 'rn-spotify-sdk';


var { width, height } = Dimensions.get('window');

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spotifyInitialized: false,
            loggedIn: false,
            loading: false,
            token: null,
            username: null
        };
        this.spotifyLoginButtonWasPressed = this.spotifyLoginButtonWasPressed.bind(this);
    }

    async initializeIfNeeded() {
        if (!await Spotify.isInitializedAsync()) {
            const spotifyOptions = {
                "clientID": "b1482aa94ff644f7ac9be1b1cdf2f421",
                "sessionUserDefaultsKey": "SpotifySession",
                "redirectURL": "spotify-rn-tone-access://spotify-login-callback",
                "scopes": ["playlist-read-private", "streaming", "user-library-read", "user-read-email"]
            };
            await Spotify.initialize(spotifyOptions);
        } else {
            if (await Spotify.isLoggedInAsync()) {
                this.setState({ loggedIn: true });
            }
        }
        this.setState({ spotifyInitialized: true });
    }

    componentDidUpdate() {
        if (this.state.loggedIn) {
            setTimeout(() => {
                this.props.navigator.resetTo({
                    screen: "Tone.MainScreen",
                    animated: true,
                    animationType: "fade",
                    navigatorStyle: {
                        navBarHidden: true
                    },
                    passProps: {
                        user: this.state.username,
                        tokenId: this.state.token
                    }
                })
            }, 1100)
        }
    }

    componentDidMount() {
        console.log("HELELEEOOOO MOUNTED");
        this.initializeIfNeeded().catch((error) => {
            Alert.alert("Error", error.message);
        });
    }

    spotifyLoginButtonWasPressed() {
        this.setState({ loading: true })
        Spotify.login().then(res => {
            Spotify.getMe().then(response => {
                Spotify.getSessionAsync().then(res => {
                    this.setState({ username: response.id, loggedIn: true, token: res.accessToken })
                }).catch(err => {
                    Alert.alert("Error", err.message);
                })
            }).catch(err => {
                Alert.alert("Error", err.message);
            })
        }).catch((error) => {
            Alert.alert("Error", error.message);
        });
    }

    render() {
        if (this.state.spotifyInitialized && this.state.loading && this.state.loggedIn) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator animating={true}>
                    </ActivityIndicator>
                    <Text style={styles.loadMessage}>
                        Loading...
                    </Text>
                </View>
            );
        }
        else {
            return (
                <View style={styles.container}>
                    <Text style={styles.greeting}>
                        Hey! You! Log into your spotify
                    </Text>
                    <TouchableHighlight onPress={this.spotifyLoginButtonWasPressed} style={styles.spotifyLoginButton}>
                        <Text style={styles.spotifyLoginButtonText}>Log into Spotify</Text>
                    </TouchableHighlight>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: height / 3
    },
    loadMessage: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        fontSize: 22,
        color: "black"
    },
    spotifyLoginButton: {
        justifyContent: 'center',
        borderRadius: 18,
        backgroundColor: 'green',
        overflow: 'hidden',
        width: 200,
        height: 40,
        margin: 20,
    },
    spotifyLoginButtonText: {
        fontSize: 20,
        textAlign: 'center',
        color: 'white',
    },
    greeting: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    }
});


export default Login;