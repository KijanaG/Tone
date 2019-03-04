/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { PureComponent } from 'react';
import { Platform, StyleSheet, Text, View, Button, ActivityIndicator, TouchableHighlight, Alert } from 'react-native';
import Spotify from 'rn-spotify-sdk';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
    android:
        'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});

export default class App extends PureComponent {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = {
            spotifyInitialized: false,
            text: "The bird is the word! I'm excited for the yellow cab to arrive in the morning during the power of the mind and its current and incumbent inhabitualizations.",
            token: null
        };
        this.spotifyLoginButtonWasPressed = this.spotifyLoginButtonWasPressed.bind(this);
    }

    async initializeIfNeeded() {
        // initialize Spotify if it hasn't been initialized yet
        if (!await Spotify.isInitializedAsync()) {
            // initialize spotify
            const spotifyOptions = {
                "clientID": "b1482aa94ff644f7ac9be1b1cdf2f421",
                "sessionUserDefaultsKey": "SpotifySession",
                "redirectURL": "spotify-rn-tone-access://spotify-login-callback",
                "scopes": ["playlist-read-private", "streaming", "user-library-read", "user-read-email"],
                "clientSecret": "cf242ec9b3b44cc582a5f8258356aa67"
            };
            const loggedIn = await Spotify.initialize(spotifyOptions);
            // update UI state
            this.setState({
                spotifyInitialized: true
            });
            // handle initialization
            if (loggedIn) {
                console.log("LOGGGEEDD IINNNN")
                console.log(loggedIn);
                Spotify.getMe().then(res => {
                    console.log(res);
                })
            }
        }
        else {
            // update UI state
            this.setState({
                spotifyInitialized: true
            });
            // handle logged in
            if (await Spotify.isLoggedInAsync()) {
                console.log("LOGGGEEDDD IIINNNNN")
            }
        }
    }

    componentDidUpdate() {
        console.log("State", this.state);
    }

    componentDidMount() {
        this.initializeIfNeeded().catch((error) => {
            Alert.alert("Error", error.message);
        });
    }

    spotifyLoginButtonWasPressed() {
        // log into Spotify
        Spotify.login().then((loggedIn) => {
            if (loggedIn) {
                // logged in
                Spotify.getMe().then(res => {
                    console.log("Account Data : \n",res);
                    this.setState({id: res.id})
                })
                .catch(err => {
                    Alert.alert("Error", error.message);
                })
                Spotify.getAuthAsync().then(res => {
                    // console.log("Auth Data : \n",res);
                    this.setState({token : res.accessToken})
                }).catch(err => console.log(err))
            }
        }).catch((error) => {
            Alert.alert("Error", error.message);
        });
    }


        sendNReceive = () => {
            const info = {
                text: this.state.text,
                token: this.state.token,
                id: this.state.id
            }
            fetch("http://127.0.0.1:5000/send", {
                method: 'POST',
                body: JSON.stringify(info)
            })
                .then(res => res.json())
                .then(parsedRes => {
                    console.log(parsedRes);
                })
                .catch(err => {
                    alert("Something went wrong, sorry :/");
                    console.log(err);
                })
        }

        render() {
            // return (
            //     <View style={styles.container}>
            //         <Text style={styles.welcome}>Welcome to React Native!</Text>
            //         <Text style={styles.instructions}>To get started, edit App.js</Text>
            //         <Text style={styles.instructions}>{instructions}</Text>
            //         <Button onPress={this.sendNReceive} title="Importantlying" />
            //     </View>
            // );
            if(!this.state.spotifyInitialized) {
                return (
                    <View style={styles.container}>
                        <ActivityIndicator animating={true} style={styles.loadIndicator}>
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
                        <Button onPress={this.sendNReceive} title="Importantlying" />
                    </View>
                );
            }
        }
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5FCFF',
        },
        loadIndicator: {
            //
        },
        loadMessage: {
            fontSize: 20,
            textAlign: 'center',
            margin: 10,
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