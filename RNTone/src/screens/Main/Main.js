import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Button, Image, Alert, Dimensions, TouchableOpacity, AppState } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import Voice from 'react-native-voice';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import backgroundImage from '../../assets/blank.jpg';

var { width, height } = Dimensions.get('window');
var timeout = "timeout";

class Main extends PureComponent {
    handleViewRef = ref => this.view = ref;

    constructor(props) {
        super(props);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        Voice.onSpeechStart = this.onSpeechStart;
        Voice.onSpeechEnd = this.onSpeechEnd;
        Voice.onSpeechError = this.onSpeechError;
        Voice.onSpeechResults = this.onSpeechResults;
        Voice.onSpeechRecognized = this.onSpeechRecognized;
        Voice.onSpeechPartialResult = this.onSpeechPartialResult;
    }

    state = {
        text: "",
        currentMood: "",
        time: 15000,
        songs: [],
        image: null,
        isPlaying: false,
        appState: AppState.currentState
    }

    componentDidMount() {
        console.log("Mounting");
        AppState.addEventListener('change', this._handleAppStateChange)
        this.setState({ token: this.props.tokenId, user: this.props.user })
        this.sendUser();
        this.cycle();
        this.setState({ time: 20000 })
        this.loop();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState == "inactive") {
            this.pauseMusic();
            this.stopVoice();
        }
    }

    loop = () => {
        this.view.transitionTo({ scale: 1.7 });
        setTimeout(() => { this.unloop() }, 2100)
    }
    unloop = () => {
        this.view.transitionTo({ scale: 1.0 });
        setTimeout(() => { this.loop() }, 2100)
    }

    sendUser = () => {
        let user = {
            user: this.props.user
        }
        fetch("http://127.0.0.1:5000/user", {
            method: 'POST',
            body: JSON.stringify(user)
        }).then(res => res.json())
            .then(parsedRes => {
                console.log(parsedRes);
                this.setState({ currentMood: parsedRes['mood'] })
            })
            .catch(err => {
                alert("Something went wrong, sorry!");
                console.log(err);
            })
    }

    onSpeechStart = e => { }
    onSpeechEnd = e => { }
    onSpeechError = e => {
        this.setState({ error: JSON.stringify(e.error) })
        this.destroyVoice();
    }
    onSpeechResults = e => {
        this.setState({ results: e.value })
    }

    onSpeechPartialResult = e => {
        this.setState({ partialResults: e.value })
    }

    onSpeechRecognized = e => {
        if (e.isFinal) {
            let results = this.state.results[0];
            results += ". ";
            let text = this.state.text;
            text += results;
            let length = text.split(" ").length;
            this.setState({ text: text });
            if (length > 20)
                this.sendNReceive();
            this.cycle();
        }
    }

    startVoice = async () => {
        console.log("Start Speech Recognition ~~ ")
        try {
            await Voice.start('en-US');
        } catch (e) {
            console.log(e);
        }
    }
    stopVoice = async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.log(e);
        }
    }

    destroyVoice = async () => {
        try {
            await Voice.destroy();
            this.cycle();
        } catch (e) {
            console.log(e);
        }
    }

    cycle = () => {
        this.startVoice();
        setTimeout(() => {
            this.stopVoice();
        }, this.state.time)
    }

    nextSong = () => {
        console.log("Playing Song!", this.state.songs[0]['uri']);
        Spotify.playURI(this.state.songs[0]['uri'], 0, 0);
        let cat = this.state.songs[0]['cat'];
        let songs = this.state.songs;
        let group = songs.splice(1);
        this.setState({ songs: group, category: cat });
        console.log(this.state);
        clearTimeout(timeout);
        setTimeout(() => {
            this.playBack();
        }, 1750)
    }
    playBack = () => {
        console.log("Inside PLAYBALCKCKC");
        Spotify.getPlaybackMetadataAsync().then(res => {
            console.log("Meta", res);
            let time = (res['currentTrack']['duration'] * 1000) - 3;
            this.setState({
                image: res['currentTrack']['albumCoverArtURL'],
                artist: res['currentTrack']['artistName'],
                songTitle: res['currentTrack']['name'],
                isPlaying: true
            })
            timeout = setTimeout(() => {
                this.nextSong();
            }, time);
        });
    }

    resumeMusic = () => {
        Spotify.setPlaying(true).then();
        this.setState({ isPlaying: true })
    }
    pauseMusic = () => {
        Spotify.setPlaying(false).then();
        this.setState({ isPlaying: false })
    }

    toPrevious = () => {
        Spotify.skipToPrevious().then();
        this.setState({ isPlaying: true })
    }

    sendNReceive = () => {
        console.log("Sending Voice To Server")
        const info = {
            text: this.state.text,
            token: this.state.token,
            user: this.state.user
        }
        fetch("http://127.0.0.1:5000/send", {
            method: 'POST',
            body: JSON.stringify(info)
        }).then(res => res.json())
            .then(parsedRes => {
                console.log(parsedRes)
                if (parsedRes['moodChanged']) {
                    this.setState({ currentMood: parsedRes['moodChanged'] });
                    Alert.alert("Mood Detection Changed!",
                        "Would you like to change the music to match the mood?",
                        [
                            {
                                text: "No",
                                onPress: () => console.log("Do Nothing"),
                                style: "cancel"
                            },
                            {
                                text: "Yes",
                                onPress: () => { this.populateSongs(parsedRes['data']['songs'], 0) }
                            }
                        ])
                }
                if (this.state.songs.length < 10) {
                    this.populateSongs(parsedRes['data']['songs'], 1);
                }
                this.setState({ text: "" })
                Spotify.isLoggedInAsync().then(res => {
                    if (!res) {
                        Spotify.login().then(res => console.log("Log Back In ", res))
                            .catch(err => console.log(err));
                    }
                }).catch(err => console.log(err));
            })
            .catch(err => {
                alert("Something went wrong, sorry!");
                console.log(err);
            })
    }

    populateSongs = (songs, num) => {
        let list;
        if (num)
            list = [];
        else
            list = this.state.songs;
        for (song in songs)
            list.push(songs[song]);
        this.setState({ songs: list });
        if (num == 0)
            this.nextSong();
    }

    render() {
        let URL = null;
        if (this.state.image) {
            URL = (
                <View>
                    <Image style={{ width: width, height: 372, marginTop: 20, marginBottom: 15 }}
                        source={{ uri: this.state.image }} />
                    <Text style={styles.title}>{this.state.songTitle}</Text>
                    <Text style={styles.title}>{this.state.artist}</Text>
                </View>
            )
        } else {
            URL = (
                <Animatable.View animation="rubberBand" duration={2000} iterationCount="infinite" style={{ textAlign: 'center' }}>
                    <Text>Currently Listening...</Text>
                </Animatable.View>
            )
        }
        return (
            <View style={styles.container}>
                <Image source={backgroundImage} style={{ width: width, height: height, position: "absolute", opacity: 0.35 }} />
                <Animatable.View ref={this.handleViewRef} duration={2000} style={{ alignSelf: "flex-start", marginTop: 55, marginLeft: 25, position: "absolute" }}>
                    <Icon
                        name={"ios-microphone"}
                        size={35}
                        color="#C0C0C0" />
                </Animatable.View>
                <Text style={styles.heading}>Tone</Text>
                {URL}
                <View style={styles.play}>
                    <TouchableOpacity>
                        <Icon
                            style={[styles.icon, { marginTop: 10 }]}
                            name={"ios-information-circle-outline"}
                            size={30}
                            color="#C0C0C0" />
                    </TouchableOpacity>
                    {this.state.isPlaying ?
                        <TouchableOpacity onPress={this.pauseMusic}>
                            <Icon
                                style={styles.icon}
                                name={"ios-pause"}
                                size={50}
                                color="yellow" />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={this.resumeMusic}>
                            <Icon
                                style={styles.icon}
                                name={"ios-play"}
                                size={50}
                                color="#C0C0C0" />
                        </TouchableOpacity>
                    }
                    <TouchableOpacity onPress={this.nextSong}>
                        <Icon
                            style={[styles.icon, { marginTop: 10 }]}
                            name={"ios-skip-forward"}
                            size={30}
                            color="#C0C0C0" />
                    </TouchableOpacity>
                </View>
                <Button onPress={this.sendNReceive} title="Send Voice Data" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        alignContent: "center",
        backgroundColor: "#000000"
    },
    play: {
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-between",
    },
    heading: {
        marginTop: 70,
        marginBottom: 10,
        fontFamily: "Avenir-Roman",
        fontSize: 35,
        fontWeight: "bold",
        color: "#C0C0C0",
        letterSpacing: 3,
    },
    icon: {
        marginLeft: 30,
        marginRight: 30
    },
    title: {
        textAlign: "center",
        margin: 10,
        fontSize: 24,
        fontFamily: "Avenir-Roman",
        color: "#C0C0C0"
    }
})

export default Main;
