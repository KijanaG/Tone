import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Button, Image, Alert, Dimensions, TouchableHighlight } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import Voice from 'react-native-voice';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';

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
        image: null
    }

    componentDidMount() {
        this.setState({ token: this.props.tokenId, user: this.props.user })
        this.sendUser();
        this.cycle();
        this.setState({ time: 50000 })
        this.loop();
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
        console.log("Playing Song!");
        Spotify.playURI(this.state.songs[0]['uri'], 0, 0).then();
        let cat = this.state.songs[0]['cat'];
        let songs = this.state.songs;
        let group = songs.splice(1);
        this.setState({ songs: group, category: cat });
        clearTimeout(timeout);
        setTimeout(() => {
            this.playBack();
        }, 1200)
    }
    playBack = () => {
        Spotify.getPlaybackMetadataAsync().then(res => {
            console.log("Meta", res);
            let time = (res['currentTrack']['duration'] * 1000) - 3;
            this.setState({
                image: res['currentTrack']['albumCoverArtURL'],
                artist: res['currentTrack']['artistName'],
                songTitle: res['currentTrack']['name']
            })
            timeout = setTimeout(() => {
                this.nextSong();
            }, time);
        });
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
                Spotify.renewSession().then().catch(err => {
                    Alert.alert("Error Renewing Session.", err.message)
                })
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
    }

    render() {
        let URL = null;
        if (this.state.image) {
            URL = (
                <View>
                    <Image style={{ width: width, height: 372 }}
                        source={{ uri: this.state.image }} />
                    <Text>{this.state.artist}</Text>
                    <Text>{this.state.songTitle}</Text>
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
                <Animatable.View ref={this.handleViewRef} duration={2000} style={{ alignSelf: "flex-start", marginTop: 55, marginLeft: 25 }}>
                    <Icon
                        name={"ios-microphone"}
                        size={35}
                        color="black" />
                </Animatable.View>
                <Text> This is the main screen</Text>
                <Text> This is the main screen</Text>
                <Text> This is the main screen</Text>
                {URL}
                <Button onPress={this.nextSong} title="Play song" />
                <Text> This is the main screen</Text>
                <Button onPress={this.playBack} title="Get State" />
                <Text> This is the main screen</Text>
                <View style={styles.play}>
                <Icon
                    style={styles.icon}
                    name={"ios-pause"}
                    size={40}
                    color="black" />
                <Icon
                    style={styles.icon}
                    name={"ios-play"}
                    size={40}
                    color="black" />
                <Icon
                    style={styles.icon}
                    name={"ios-skip-forward"}
                    size={40}
                    color="black" />
                </View>
                <Button onPress={this.sendNReceive} title="Send Voice Data" />

                <Text> This is the main screen</Text>
                <Text> This is the main screen</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        alignContent: "center",
        backgroundColor: "#afb5d7"
    },
    play: {
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-between"
    },
    text: {
        margin: -5
    },
    icon: {
        // alignItems: "center",
        // textAlign: "center",
        marginRight: 36,
        marginLeft: 36
    }
})

export default Main;
