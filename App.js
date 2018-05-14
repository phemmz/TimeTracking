import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  AsyncStorage,
  Alert,
  Image,
  TouchableHighlight,
  BackHandler,
} from 'react-native';
import uuidv4 from 'uuid/v4';
import { Constants } from 'expo';

import AuthorRow from './components/AuthorRow';
import Card from './components/Card';
import CardList from './components/CardList';
import Status from './components/Status';
import MessageList from './components/MessageList';
import Feed from './screens/Feed';
import Comments from './screens/Comments';

const items = [
  { id: 0, author: 'Bob Ross' },
  { id: 1, author: 'Chuck Norris' },
];


const ASYNC_STORAGE_COMMENTS_KEY = 'ASYNC_STORAGE_COMMENTS_KEY';


export default class App extends React.Component {
  state = {
    commentsForItem: {},
    showModal: false,
    selectedItemId: null,
    messages: [
      this.createImageMessage('https://unsplash.it/300/300'),
      this.createTextMessage('World'),
      this.createTextMessage('Hello'),
      this.createLocationMessage({
        latitude: 37.78825,
        longitude: -122.4324,
      }),
    ],
    fullscreenImageId: null,
  };

  constructor(props) {
    super(props);

    this.messageId = 0;
  }

  componentWillMount() {
    this.subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const { fullscreenImageId } = this.state;
      if (fullscreenImageId) {
        this.dismissFullscreenImage();
        return true;
      }
      return false;
    });
  }

  async componentDidMount() {
    try {
      const commentsForItem = await AsyncStorage.getItem( ASYNC_STORAGE_COMMENTS_KEY,);
      this.setState({
        commentsForItem: commentsForItem ? JSON.parse(commentsForItem) : {},
      });
    } catch (error) {
      console.log('Failed to load comments');
    }
  }

  openCommentScreen = id => {
    this.setState({
      showModal: true,
      selectedItemId: id,
    });
  };

  closeCommentScreen = () => {
    this.setState({
      showModal: false,
      selectedItemId: null,
    });
  };

  onSubmitComment = (text) => {
    const { selectedItemId, commentsForItem } = this.state;
    const comments = commentsForItem[selectedItemId] || [];
    const updated = {
      ...commentsForItem,
      [selectedItemId]: [...comments, text],
    };

    this.setState({ commentsForItem: updated });

    try {
      AsyncStorage.setItem(ASYNC_STORAGE_COMMENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log('Failed to save comment', text, 'for', selectedItemId);
    }
  };

  renderMessageList() {
    const { messages } = this.state;

    return (
      <View style={styles.content}>
        <MessageList messages={messages} onPressMessage={this.handlePressMessage} />
      </View>
    );
  }

  renderInputMethodEditor() {
    return (
      <View style={styles.inputMethodEditor}></View>
    );
  }

  renderToolbar() {
    return (
      <View style={styles.toolbar}></View>
    );
  }

  getNextId() {
    this.messageId += 1;
    return this.messageId;
  }

  createTextMessage(text) {
    return {
      type: 'text',
      id: uuidv4(),
      text,
    };
  }

  createImageMessage(uri) {
    return {
      type: 'image',
      id: uuidv4(),
      uri,
    };
  }

  createLocationMessage(coordinate) {
    return {
      type: 'location',
      id: uuidv4(),
      coordinate,
    };
  }

  handlePressMessage = ({ id, type }) => {
    switch (type) {
      case 'text':
        Alert.alert(
          'Delete message?',
          'Are you sure you want to permanently delete this message?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                const { messages } = this.state;
                this.setState({
                  messages: messages.filter(message => message.id !== id)
                });
              },
            }
          ],
        );
        break;
      case 'image':
        this.setState({ fullscreenImageId: id });
        break;
      default:
        break;
    }
  }

  dismissFullscreenImage = () => {
    this.setState({ fullscreenImageId: null });
  };

  renderFullscreenImage = () => {
    const { messages, fullscreenImageId } = this.state;

    if (!fullscreenImageId) return null;
    const image = messages.find(message => message.id === fullscreenImageId);
    if (!image) return null;
    const { uri } = image;
    return (
      <TouchableHighlight style={styles.fullscreenOverlay} onPress={this.dismissFullscreenImage}>
        <Image style={styles.fullscreenImage} source={{ uri }} />
      </TouchableHighlight>
    );
  };

  componentWillUnmount() {
    this.subscription.remove();
  }

  render() {
    const { commentsForItem, showModal, selectedItemId } = this.state;

    return (
      <View style={styles.container}>
        <Status />
        {this.renderMessageList()}
        {this.renderToolbar()}
        {this.renderInputMethodEditor()}
        {this.renderFullscreenImage()}
      </View>
      // <View style={styles.container}>
      //   <Feed
      //     style={styles.feed}
      //     commentsForItem={commentsForItem}
      //     onPressComments={this.openCommentScreen}
      //   />
      //   <Modal
      //     visible={showModal}
      //     animationType="slide"
      //     onRequestClose={this.closeCommentScreen}
      //   >
      //     <Comments
      //       style={styles.container}
      //       comments={commentsForItem[selectedItemId] || []}
      //       onClose={this.closeCommentScreen}
      //       onSubmitComment={this.onSubmitComment}
      //     />
      //   </Modal>
      // </View>
    );
  }
}

const platformVersion = Platform.OS === 'ios' ? parseInt(Platform.Version, 10) : Platform.Version;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputMethodEditor: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    backgroundColor: 'white',
  },
  feed: {
    flex: 1,
    marginTop: Platform.OS === 'android' || platformVersion < 11 ? Constants.statusBarHeight : 0,
  },
  comments: {
    flex: 1,
    marginTop: Platform.OS === 'ios' && platformVersion < 11 ? Constants.statusBarHeight : 0,
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 2,
  },
  fullscreenImage: {
    flex: 1,
    resizeMode: 'contain',
  },
});
