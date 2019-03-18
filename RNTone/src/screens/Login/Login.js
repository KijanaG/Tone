import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { authenticate, login } from '../../store/actions';
import backgroundImage from '../../assets/astro.jpg';
import * as Animatable from 'react-native-animatable';

var { width, height } = Dimensions.get('window');

class Login extends Component {
    handleT = ref => this.tee = ref;
    handleO = ref => this.oh = ref;
    handleA = ref => this.ay = ref;
    handleN = ref => this.en = ref;
    handleE = ref => this.ee = ref;
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
        this.spotifyLoginButtonWasPressed = this.spotifyLoginButtonWasPressed.bind(this);
    }

    componentDidUpdate() {
        if (this.props.loggedIn) {
            setTimeout(() => {
                this.props.navigator.resetTo({
                    screen: "Toane.MainScreen",
                    animated: true,
                    animationType: "fade",
                    navigatorStyle: {
                        navBarHidden: true
                    }
                })
            }, 1100)
        }
    }

    componentDidMount() {
        this.props.onAuthenticate();
        this.animateHeader();
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
    }

    spotifyLoginButtonWasPressed() {
        this.setState({ loading: true })
        this.props.onLogin();
    }

    render() {
        if (this.state.loading && this.props.loggedIn) {
            return (
                <View style={styles.container}>
                    <Image source={backgroundImage} style={styles.background} />
                    <ActivityIndicator animating={true}>
                    </ActivityIndicator>
                    <Text style={[styles.toane, {fontSize: 22}]}>
                        Loading...
                    </Text>
                </View>
            );
        }
        else {
            return (
                <View style={styles.container}>
                    <Image source={backgroundImage} style={styles.background} />
                    <View style={styles.heading}>
                        <Text style={styles.toane}>Welcome to </Text>
                        <Animatable.Text ref={this.handleT} animation="pulse" iterationCount={1} style={styles.toane} >T</Animatable.Text>
                        <Animatable.Text ref={this.handleO} animation="pulse" iterationCount={1} style={styles.toane} >o</Animatable.Text>
                        <Animatable.Text ref={this.handleA} animation="pulse" iterationCount={1} style={styles.toane} >a</Animatable.Text>
                        <Animatable.Text ref={this.handleN} animation="pulse" iterationCount={1} style={styles.toane} >n</Animatable.Text>
                        <Animatable.Text ref={this.handleE} animation="pulse" iterationCount={1} style={styles.toane} >e</Animatable.Text>
                    </View>
                    <TouchableOpacity onPress={this.spotifyLoginButtonWasPressed} >
                        <Animatable.View duration={2200} iterationCount="infinite" animation="pulse" style={styles.spotifyLoginButton}>
                            <Text style={styles.spotifyLoginButtonText}>Log into your Spotify</Text>
                        </Animatable.View>
                    </TouchableOpacity>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    background: {
        width: width,
        height: height,
        position: "absolute",
        opacity: 1
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: height / 3
    },
    block: {
        backgroundColor: "white",
        width: width,
        height: height / 3,
        position: "absolute",
        marginTop: height / 3,
        zIndex: 2,
        backgroundColor: "transparent"
    },
    greeting: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    heading: {
        marginBottom: 20,
        flexDirection: "row"
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
        borderRadius: 20,
        backgroundColor: '#4da854',
        overflow: 'hidden',
        width: 220,
        height: 45,
        margin: 20,
        opacity: 0.9,
        position: "relative",
        zIndex: 0
    },
    spotifyLoginButtonText: {
        fontSize: 20,
        textAlign: 'center',
        fontFamily: "Avenir-Roman",
        color: 'black',
        fontWeight: "bold"
    },
    toane: {
        fontFamily: "Avenir-Roman",
        fontSize: 35,
        fontWeight: "bold",
        color: "silver",
        letterSpacing: 2,
    }
});

const mapStateToProps = state => {
    return {
        loggedIn: state.auth.isLoggedIn
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAuthenticate: () => dispatch(authenticate()),
        onLogin: () => dispatch(login())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)