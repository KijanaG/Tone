import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Button, Image, Alert, Dimensions, TouchableOpacity, AppState, ActivityIndicator } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import Voice from 'react-native-voice';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import backgroundImage from '../../assets/blank.jpg';
import colorTheme from '../../assets/colorTheme.json';

var { width, height } = Dimensions.get('window');
var timeout = "timeout";

class Main extends PureComponent {
    handleViewRef = ref => this.view = ref;
    handleT = ref => this.tee = ref;
    handleO = ref => this.oh = ref;
    handleN = ref => this.en = ref;
    handleE = ref => this.ee = ref;

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
        time: 10000,
        songs: [],
        image: null,
        isPlaying: false,
        appState: AppState.currentState,
        songTitle: "",
        artist: "",
        stars: [0, 0, 0, 0, 0],
        starCount: 0,
        countDown: 5, //15
        alert: false
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange)
        this.setState({ token: this.props.tokenId, user: this.props.user })
        this.sendUser();
        this.cycle();
        this.loop();
        this.animateHeader();
        setTimeout(() => {
            this.countDown();
        }, 1000)
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState == "inactive") {
            this.pauseMusic();
            this.stopVoice();
        } else if (nextAppState == "active") {
            Spotify.isLoggedInAsync().then(res => {
                if (!res)
                    Spotify.login().then(res => console.log("Log Back In ", res)).catch(err => console.log(err));
                else
                    Spotify.renewSession().then(res => console.log(res));
            }).catch(err => console.log(err));
        }
    }

    countDown = async () => {
        let count = this.state.countDown - 1;
        if (count < 0) {
            await this.sendNReceive();
            this.nextSong();
            return;
        }
        this.setState({ countDown: count });
        setTimeout(() => {
            this.countDown();
        }, 1000)
    }

    loop = () => {
        this.view.transitionTo({ scale: 1.7 });
        setTimeout(() => { this.unloop() }, 2100)
    }
    unloop = () => {
        this.view.transitionTo({ scale: 1.0 });
        setTimeout(() => { this.loop() }, 2100)
    }
    animateHeader = () => {
        this.tee.transitionTo({ scale: 1.5 });
        setTimeout(() => { this.oh.transitionTo({ scale: 1.5 }) }, 150)
        setTimeout(() => { this.en.transitionTo({ scale: 1.5 }) }, 300)
        setTimeout(() => { this.ee.transitionTo({ scale: 1.5 }) }, 450)
        setTimeout(() => { this.inanimateHeader() }, 450)
    }
    inanimateHeader = () => {
        this.tee.transitionTo({ scale: 1.0 });
        setTimeout(() => { this.oh.transitionTo({ scale: 1.0 }) }, 150)
        setTimeout(() => { this.en.transitionTo({ scale: 1.0 }) }, 300)
        setTimeout(() => { this.ee.transitionTo({ scale: 1.0 }) }, 450)
        setTimeout(() => { this.animateHeader() }, 30000)
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
        Spotify.isLoggedInAsync().then(res => {
            if (!res)
                Spotify.login().then(res => console.log("Log Back In ", res)).catch(err => console.log(err));
        }).catch(err => console.log(err));
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

    nextSong = async () => {
        clearTimeout(timeout);
        if (this.state.songs.length < 5)
            this.sendNReceive();
        if (this.state.starCount != 1 &&
            this.state.starCount != 2) {
            this.updatePreferences();
            await Spotify.playURI(this.state.songs[0]['uri'], 0, 0)
                .then(res => {
                    setTimeout(() => {
                        this.playBack();
                    }, 1750)
                }).catch(err => {
                    Spotify.login().then(res => console.log("Log Back In ", res)).catch(err => console.log(err));
                });
            let cat = this.state.songs[0]['cat'];
            let songs = this.state.songs;
            let group = songs.splice(1);
            this.setState({ songs: group, category: cat });
        } else {
            this.updatePreferences();
        }
    }

    playBack = () => {
        Spotify.getPlaybackMetadataAsync().then(res => {
            let time = (res['currentTrack']['duration'] * 1000) - 2;
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
        Spotify.setPlaying(true).then(
            setTimeout(() => {
                Spotify.getPlaybackStateAsync().then(res => {
                    pos = res.position + 2;
                    if (res) {
                        Spotify.getPlaybackMetadataAsync().then(res => {
                            let time = (res['currentTrack']['duration'] * 1000) - pos;
                            timeout = setTimeout(() => {
                                this.nextSong();
                            }, time)
                        })
                    }
                })
            }, 2000)
        );
        this.setState({ isPlaying: true })
    }
    pauseMusic = () => {
        Spotify.setPlaying(false).then();
        this.setState({ isPlaying: false })
        clearTimeout(timeout);
    }

    toPrevious = () => {
        Spotify.skipToPrevious().then();
        this.setState({ isPlaying: true })
    }

    ratings = (id) => {
        if (id == 0 && this.state.stars[0] == 1) {
            this.setState({ stars: [0, 0, 0, 0, 0], starCount: 0 })
            return;
        }
        let stars = [0, 0, 0, 0, 0];
        let fill = 0;
        if (stars[id] == 0)
            fill = 1;
        for (var i = id; i >= 0; i--)
            stars[i] = fill;
        this.setState({ stars: stars, starCount: id + 1 });
    }

    updateMood = () => {
        const info = {
            mood: this.state.currentMood,
            user: this.state.user
        }
        fetch("http://127.0.0.1:5000/mood", {
            method: "POST",
            body: JSON.stringify(info)
        }).then(res => res.json())
            .then(parsedRes => console.log(parsedRes));
    }

    stater = () => {
        console.log(this.state);
    }

    alertListener = () => {
        let alertActivated = this.state.alert;
        this.setState({ alert: !alertActivated });
    }

    updatePreferences = () => {
        if (this.state.starCount != 0) {
            const info = {
                rating: this.state.starCount,
                user: this.state.user,
                category: this.state.category,
                token: this.state.token
            }
            fetch("http://127.0.0.1:5000/update", {
                method: "POST",
                body: JSON.stringify(info)
            }).then(res => res.json())
                .then(parsedRes => {
                    if (parsedRes['change']) {
                        this.populateSongs(parsedRes['data']['songs'], 0);
                    } else {
                        this.populateSongs(parsedRes['data']['songs'], 1);
                    }
                }).catch(err => {
                    console.log(err);
                })
        }
        this.setState({ starCount: 0, stars: [0, 0, 0, 0, 0] })
    }

    sendNReceive = async () => {
        console.log("Sending Voice To Server")
        const info = {
            text: this.state.text,
            token: this.state.token,
            user: this.state.user
        }
        await fetch("http://127.0.0.1:5000/send", {
            method: 'POST',
            body: JSON.stringify(info)
        }).then(res => res.json())
            .then(parsedRes => {
                console.log(parsedRes);
                if (parsedRes['moodChanged']) {
                    this.setState({ currentMood: parsedRes['data']['mood'] });
                    if (!this.state.alert) {
                        this.alertListener();
                        Alert.alert("Mood Detection Changed!",
                            "Would you like to change the music to match the mood?",
                            [{
                                text: "No",
                                onPress: () => this.alertListener(),
                                style: "cancel"
                            }, {
                                text: "Yes",
                                onPress: () => {
                                    this.populateSongs(parsedRes['data']['songs'], 0);
                                    this.alertListener();
                                }
                            }
                            ])
                    }
                }
                if (this.state.songs.length < 10)
                    this.populateSongs(parsedRes['data']['songs'], 1);
                this.setState({ text: "" })
                Spotify.isLoggedInAsync().then(res => {
                    if (!res)
                        Spotify.login().then(res => console.log("Log Back In ", res)).catch(err => Alert.alert("Error", error.message));
                    else
                        Spotify.renewSession().then();
                }).catch(err => console.log(err));
            }).catch(err => {
                alert("Something went wrong, sorry!");
                console.log(err);
            })
    }

    populateSongs = (songs, num) => {
        let list;
        if (num == 0) {
            list = [];
            this.updateMood();
        } else
            list = this.state.songs;
        for (song in songs)
            list.push(songs[song]);
        this.setState({ songs: list });
        if (num == 0)
            this.nextSong();
    }

    render() {
        let songFont = null;
        if (this.state.songTitle.length > 26) songFont = { fontSize: 20 };
        let artistFont = null;
        if (this.state.artist.length > 26) artistFont = { fontSize: 20 };
        let stars = null;
        stars = this.state.stars.map((star, i) => {
            return <TouchableOpacity key={i} onPress={() => this.ratings(i)}><Icon style={{ marginLeft: 10, marginRight: 10 }} name={star == 0 ? "ios-star-outline" : "ios-star"} size={28} color="#C0C0C0" /></TouchableOpacity>
        })
        let URL = null;
        if (this.state.image) {
            URL = (
                <View>
                    <Image style={{ width: width, height: 372, marginTop: 20, marginBottom: 15 }}
                        source={{ uri: this.state.image }} />
                    <Text style={[styles.title, songFont]}>{this.state.songTitle}</Text>
                    <Text style={[styles.title, artistFont]}>{this.state.artist}</Text>
                    <View style={styles.play}>
                        <TouchableOpacity>
                            <Icon
                                style={[styles.icon, { marginTop: 11 }]}
                                name={"ios-information-circle-outline"}
                                size={30}
                                color={colorTheme[this.state.category]} />
                        </TouchableOpacity>
                        {this.state.isPlaying ?
                            <TouchableOpacity onPress={this.pauseMusic}>
                                <Icon
                                    style={styles.icon}
                                    name={"ios-pause"}
                                    size={50}
                                    color={colorTheme[this.state.category]} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={this.resumeMusic}>
                                <Icon
                                    style={styles.icon}
                                    name={"ios-play"}
                                    size={50}
                                    color={colorTheme[this.state.category]} />
                            </TouchableOpacity>
                        }
                        <TouchableOpacity onPress={this.nextSong}>
                            <Icon
                                style={[styles.icon, { marginTop: 10 }]}
                                name={"ios-skip-forward"}
                                size={30}
                                color={colorTheme[this.state.category]} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 10 }}>
                        {stars}
                    </View>
                </View>
            )
        } else {
            if (this.state.countDown > 0) {
                URL = (
                    <View>
                        <Animatable.View animation="rubberBand" duration={4500} iterationCount="infinite" style={styles.listen}>
                            <Text style={styles.listening}>Currently Listening...</Text>
                        </Animatable.View>
                        <Text style={styles.listening}>{this.state.countDown}</Text>
                    </View>
                )
            } else {
                URL = (
                    <View style={styles.listen}>
                        <ActivityIndicator animating={true} />
                    </View>
                )
            }
        }
        let frame = "#000000";
        if(this.state.currentMood == "negative")
            frame = "#153139FF";
        else if(this.state.currentMood == "positive")
            frame = "#3e1e0f";
        return (
            <View style={[styles.container, {backgroundColor: frame}]}>
                <Image source={backgroundImage} style={{ width: width, height: height, position: "absolute", opacity: 0.35 }} />
                <Animatable.View ref={this.handleViewRef} duration={2000} style={{ alignSelf: "flex-start", marginTop: 55, marginLeft: 25, position: "absolute" }}>
                    <Icon
                        name={"ios-microphone"}
                        size={35}
                        color="#C0C0C0" />
                </Animatable.View>
                <View style={styles.heading}>
                    <Animatable.Text ref={this.handleT} animation="pulse" iterationCount="infinite" style={styles.tone} >T</Animatable.Text>
                    <Animatable.Text ref={this.handleO} animation="pulse" iterationCount="infinite" style={styles.tone} >o</Animatable.Text>
                    <Animatable.Text ref={this.handleN} animation="pulse" iterationCount="infinite" style={styles.tone} >n</Animatable.Text>
                    <Animatable.Text ref={this.handleE} animation="pulse" iterationCount="infinite" style={styles.tone} >e</Animatable.Text>
                </View>
                {URL}
                <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                    <Button onPress={this.nextSong} title="Get Song" />
                    <Button onPress={this.sendNReceive} title="Send" />
                    <Button onPress={this.stater} title="State" />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        alignContent: "center"
    },
    play: {
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-between",
        marginTop: 10
    },
    heading: {
        marginTop: 100,
        marginBottom: 10,
        flexDirection: "row"
    },
    icon: {
        marginLeft: 30,
        marginRight: 30
    },
    tone: {
        fontFamily: "Avenir-Roman",
        fontSize: 35,
        fontWeight: "bold",
        color: "#C0C0C0",
        letterSpacing: 2,
    },
    title: {
        textAlign: "center",
        margin: 8,
        fontSize: 24,
        fontFamily: "Avenir-Roman",
        color: "#C0C0C0"
    },
    listen: {
        marginTop: height / 4,
    },
    listening: {
        fontSize: 26,
        fontFamily: "Avenir-Roman",
        fontWeight: "bold",
        color: "#C0C0C0",
        textAlign: "center"
    }
})

export default Main;
