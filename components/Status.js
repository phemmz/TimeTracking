import React from 'react';
import { Constants } from 'expo';
import { NetInfo, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';

const statusHeight = (Platform.OS === 'ios' ? Constants.statusBarHeight : 0);

export default class Status extends React.Component {
  state = {
    info: 'none',
  };

  constructor(props) {
    super(props);

    this.messageId = 0;
  }

  async componentWillMount() {
    this.subscription = NetInfo.addEventListener('connectionChange', this.handleChange);
    const info = await NetInfo.getConnectionInfo();
    this.setState({ info });
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  handleChange = (info) => {
    this.setState({ info });
    StatusBar.setBarStyle(info === 'none' ? 'light-content' : 'dark-content');
  };

  


  render() {
    const { info } = this.state;
    const isConnected = info !== 'none';
    const backgroundColor = isConnected ? 'white' : 'red';

    const messageContainer = (
      <View style={styles.messageContainer} pointerEvents={'none'}>
        {!isConnected && (
          <View style={styles.bubble}>
            <Text style={styles.text}>No network connection</Text>
          </View>
        )}
      </View>
    );
      

    if (Platform.OS === 'ios') {
      return <View style={[styles.status, { backgroundColor }]}>{messageContainer}</View>;
    }
    return messageContainer; // Temporary! 
  }
}

const styles = StyleSheet.create({
  status: {
    zIndex: 1,
    height: statusHeight,
  },
  messageContainer: {
    zIndex: 1,
    position: 'absolute',
    top: statusHeight + 20,
    right: 0,
    left: 0,
    height: 80,
    alignItems: 'center',
  },
  bubble: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'red',
  },
  text: {
    color: 'white',
  },
});
