import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Button, Image, ScrollView, Alert, Dimensions, TouchableOpacity, AppState, ActivityIndicator, Modal } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import Voice from 'react-native-voice';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import backgroundImage from '../../assets/blank.jpg';
import colorTheme from '../../assets/colorTheme.json';
import Volume from '../../assets/volume.jpg';

import { authenticate, login, verifyUser, sendText, alertChange, setSongData, updateMoodDB, updatePrefs } from '../../store/actions';
import { connect } from 'react-redux';

var { width, height } = Dimensions.get('window');
var timeout = "timeout";

class Main extends PureComponent {
    handleViewRef = ref => this.view = ref;
    handleT = ref => this.tee = ref;
    handleO = ref => this.oh = ref;
    handleA = ref => this.ay = ref;
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
        time: 14000,
        image: null,
        isPlaying: false,
        appState: AppState.currentState,
        songTitle: "",
        artist: "",
        stars: [0, 0, 0, 0, 0],
        starCount: 0,
        countDown: 15,
        modal: false
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.props.verifyUser();
        this.cycle();
        this.loop();
        this.animateHeader();
        setTimeout(() => { 
            this.countDown();
            this.setState({time: 50000});
        }, 1000)
        setTimeout(() => {
            if (this.props.newUser)
                this.setState({ modal: true })
        }, 20000)
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState == "inactive") {
            this.pauseMusic();
            this.stopVoice();
        } else if (nextAppState == "active") {
            this.props.onAuthenticate();
        }
    }

    countDown = async () => {
        let count = this.state.countDown - 1;
        if (count < 0) {
            await this.props.sendVoiceData(this.state.text);
            this.nextSong();
            return;
        }
        this.setState({ countDown: count });
        setTimeout(() => { this.countDown() }, 1000)
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
        setTimeout(() => { this.ay.transitionTo({ scale: 1.5 }) }, 300)
        setTimeout(() => { this.en.transitionTo({ scale: 1.5 }) }, 450)
        setTimeout(() => { this.ee.transitionTo({ scale: 1.5 }) }, 600)
        setTimeout(() => { this.inanimateHeader() }, 600)
    }
    inanimateHeader = () => {
        this.tee.transitionTo({ scale: 1.0 });
        setTimeout(() => { this.oh.transitionTo({ scale: 1.0 }) }, 150)
        setTimeout(() => { this.ay.transitionTo({ scale: 1.0 }) }, 300)
        setTimeout(() => { this.en.transitionTo({ scale: 1.0 }) }, 450)
        setTimeout(() => { this.ee.transitionTo({ scale: 1.0 }) }, 600)
        setTimeout(() => { this.animateHeader() }, 30000)
    }

    onSpeechStart = e => { }
    onSpeechEnd = e => { }
    onSpeechError = e => { this.destroyVoice() }
    onSpeechPartialResult = e => { }
    onSpeechResults = e => { this.setState({ results: e.value }) }

    onSpeechRecognized = async e => {
        if (e.isFinal) {
            let results = this.state.results[0];
            results += ". ";
            let text = this.state.text;
            text += results;
            let length = text.split(" ").length;
            this.setState({ text: text });
            if (length > 20) {
                await this.props.sendVoiceData(this.state.text);
                this.setState({ text: "" });
                if (this.props.alert)
                    this.alertListener();
            }
            this.cycle();
        }
    }

    startVoice = async () => {
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
        let sc = this.state.starCount;
        clearTimeout(timeout);
        if (this.props.songs.length < 5) {
            await this.props.sendVoiceData(this.state.text);
            if (this.props.alert)
                this.alertListener();
        }
        if (sc != 1 && sc != 2) {
            if (sc != 0)
                this.props.updatePrefs(sc);
            this.setState({ starCount: 0, stars: [0, 0, 0, 0, 0] })
            await Spotify.playURI(this.props.songs[0]['uri'], 0, 0)
                .then().catch(err => {
                    Spotify.login().then()
                        .catch(err => this.props.onAuthenticate());
                });
            setTimeout(() => {
                this.playBack();
            }, 1750)
            this.props.setSong();
        } else {
            if (sc != 0)
                await this.props.updatePrefs(sc);
            if (sc == 1 || sc == 2)
                this.nextSong();
            this.setState({ starCount: 0, stars: [0, 0, 0, 0, 0] })
        }
    }

    playBack = async () => {
        await Spotify.getPlaybackMetadataAsync().then(res => {
            let time = (res['currentTrack']['duration'] * 1000) - 1750;
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
                    pos = (res.position + 2) * 1000;
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

    modal = () => {
        let modal = this.state.modal;
        this.setState({ modal: !modal });
    }

    alertListener = () => {
        Alert.alert("Mood Detection Changed!",
            "Would you like to change the music to match the mood?",
            [{
                text: "No",
                onPress: () => {
                    this.props.change(false);
                },
                style: "cancel"
            }, {
                text: "Yes",
                onPress: () => {
                    this.props.change(true);
                    this.props.updateMood();
                    setTimeout(() => {
                        this.nextSong();
                    }, 1000)
                }
            }
            ])
    }

    render() {
        let songFont = null;
        if (this.state.songTitle.length > 26) songFont = { fontSize: height > 700 ? 20 : 18 };
        let artistFont = null;
        if (this.state.artist.length > 26) artistFont = { fontSize: height > 700 ? 20 : 18 };
        let stars = null;
        stars = this.state.stars.map((star, i) => {
            return <TouchableOpacity key={i} onPress={() => this.ratings(i)}>
                <Icon style={{ marginLeft: 10, marginRight: 10 }}
                    name={star == 0 ? "ios-star-outline" : "ios-star"} size={28} color={colorTheme[this.props.category]} />
            </TouchableOpacity>
        })
        let URL = null;
        if (this.state.image) {
            URL = (
                <View>
                    <Image style={styles.image}
                        source={{ uri: this.state.image }} />
                    <Text style={[styles.title, songFont]}>{this.state.songTitle}</Text>
                    <Text style={[styles.title, artistFont]}>{this.state.artist}</Text>
                    <View style={styles.play}>
                        <TouchableOpacity onPress={this.modal}>
                            <Icon style={[styles.icon, { marginTop: 11 }]} name={"ios-information-circle-outline"}
                                size={30} color={colorTheme[this.props.category]} />
                        </TouchableOpacity>
                        {this.state.isPlaying ?
                            <TouchableOpacity onPress={this.pauseMusic}>
                                <Icon style={styles.icon} name={"ios-pause"}
                                    size={50} color={colorTheme[this.props.category]} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={this.resumeMusic}>
                                <Icon style={styles.icon} name={"ios-play"}
                                    size={50} color={colorTheme[this.props.category]} />
                            </TouchableOpacity>
                        }
                        <TouchableOpacity onPress={this.nextSong}>
                            <Icon style={[styles.icon, { marginTop: 10 }]} name={"ios-skip-forward"}
                                size={30} color={colorTheme[this.props.category]} />
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
                        <ActivityIndicator style={{ marginBottom: 10 }} animating={true} />
                        <Text style={[styles.listening, { fontSize: 14 }]}>If song fails to load after 5 seconds</Text>
                        <Button onPress={this.nextSong} title="Click Here!" />
                    </View>
                )
            }
        }
        let frame = "#000000";
        if (this.state.currentMood == "negative")
            frame = "#153139FF";
        else if (this.state.currentMood == "positive")
            frame = "#3e1e0f";
        return (
            <View style={[styles.container, { backgroundColor: frame }]}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modal}>
                    <ScrollView>
                        <View style={{ flexDirection: "row", marginTop: 30, marginBottom: 20, justifyContent: "center" }}>
                            <Text style={[styles.listening, { marginTop: height > 700 ? 40 : 25, color: "#909090", fontSize: 28 }]}> Welcome to Toane</Text>
                            <TouchableOpacity onPress={this.modal} style={{ position: "absolute", right: 30 }}>
                                <Icon
                                    name={"ios-close"}
                                    size={55}
                                    color="#909090" />
                            </TouchableOpacity>
                        </View>
                        <Image source={Volume} style={{ width: 60, height: 60, marginBottom: 20, alignSelf: "center" }} />
                        <Text style={styles.text}>
                            Toane uses Google Sentiment Analysis to extract emotion from the conversation taking place.
                            The goal behind the technology is to play music that matches a given mood – positive, negative, or neutral.
                    </Text>
                        <Icon
                            style={{ alignSelf: "center", marginTop: 8 }}
                            name={"ios-microphone"}
                            size={55}
                            color="#909090" />
                        <Text style={styles.text}>
                            Toane uses ratings on songs to adapt our algorithms to your preference for a given mood. So by ranking songs with a number of stars,
                            oyu are providing the input we need to expose you to genres that you enjoy and that fit the vibe of any room!
                    </Text>
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.bullet}>• Zero stars does nothing. </Text>
                            <Text style={styles.bullet}>• 1 – 2 stars will discourage the current music and change the current station. </Text>
                            <Text style={styles.bullet}>• 3 stars is neutral, neither good nor bad. </Text>
                            <Text style={styles.bullet}>• 4 – 5 stars will encourage the music and keep the current station.</Text>
                        </View>
                    </ScrollView>
                </Modal>
                <Image source={backgroundImage} style={styles.background} />
                <Animatable.View ref={this.handleViewRef} duration={2100} style={styles.animated}>
                    <Icon
                        name={"ios-microphone"}
                        size={35}
                        color="#C0C0C0" />
                </Animatable.View>
                <View style={styles.heading}>
                    <Animatable.Text ref={this.handleT} animation="pulse" iterationCount="infinite" style={styles.toane} >T</Animatable.Text>
                    <Animatable.Text ref={this.handleO} animation="pulse" iterationCount="infinite" style={styles.toane} >o</Animatable.Text>
                    <Animatable.Text ref={this.handleA} animation="pulse" iterationCount="infinite" style={styles.toane} >a</Animatable.Text>
                    <Animatable.Text ref={this.handleN} animation="pulse" iterationCount="infinite" style={styles.toane} >n</Animatable.Text>
                    <Animatable.Text ref={this.handleE} animation="pulse" iterationCount="infinite" style={styles.toane} >e</Animatable.Text>
                </View>
                {URL}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    animated: {
        alignSelf: "flex-start",
        marginTop: height > 700 ? 55 : 35,
        marginLeft: 25,
        position: "absolute"
    },
    background: {
        width: width,
        height: height,
        position: "absolute",
        opacity: 0.35
    },
    bullet: {
        fontSize: 14,
        textAlign: "center",
        margin: 10,
        marginRight: 30,
        marginLeft: 15,
        fontFamily: "Avenir-Roman",
    },
    container: {
        flex: 1,
        alignItems: "center",
        alignContent: "center"
    },
    heading: {
        marginTop: height > 700 ? 70 : 40,
        marginBottom: 10,
        flexDirection: "row"
    },
    icon: {
        marginLeft: 30,
        marginRight: 30
    },
    image: {
        width: width,
        height: height > 700 ? 372 : 305,
        marginTop: 20,
        marginBottom: 15
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
    },
    play: {
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-between",
        marginTop: 10
    },
    title: {
        textAlign: "center",
        margin: height > 700 ? 8 : 6,
        fontSize: 24,
        fontFamily: "Avenir-Roman",
        color: "#C0C0C0"
    },
    text: {
        margin: 10,
        width: width / 1.05,
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "Avenir-Roman",
    },
    toane: {
        fontFamily: "Avenir-Roman",
        fontSize: 35,
        fontWeight: "bold",
        color: "#C0C0C0",
        letterSpacing: 2,
    }
})

const mapStateToProps = state => {
    return {
        loggedIn: state.auth.isLoggedIn,
        id: state.auth.id,
        token: state.auth.token,
        songs: state.songs.songs,
        mood: state.songs.currentMood,
        alert: state.songs.alert,
        category: state.songs.category,
        newUser: state.songs.newUser
    }
}

const mapDispatchToProps = dispatch => {
    return {
        verifyUser: () => dispatch(verifyUser()),
        sendVoiceData: (text) => dispatch(sendText(text)),
        onAuthenticate: () => dispatch(authenticate()),
        change: (i) => dispatch(alertChange(i)),
        updateMood: () => dispatch(updateMoodDB()),
        setSong: () => dispatch(setSongData()),
        updatePrefs: (rating) => dispatch(updatePrefs(rating))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
