import { ActivityIndicator, Text, ViewPropTypes, SafeAreaView, } from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
// import { fetchImages } from '../utils/api';
import CardList from '../components/CardList';

export default class Feed extends React.Component {
  state = {
    loading: true,
    error: false,
    items: [],
  };

  componentDidMount() {
    try {
      this.setState({
        loading: false,
        items: [
          { id: 0, author: 'Bob Ross' },
          { id: 1, author: 'Chuck Norris' },
        ],
      });
    } catch (e) {
      this.setState({
        loading: false, error: true,
      });
    }
  }

  render() {
    const { commentsForItem, onPressComments, style } = this.props;
    const { loading, error, items } = this.state;
    if (loading) {
      return <ActivityIndicator size="large" />;
    }
    if (error) {
      return <Text>Error...</Text>;
    }
    return (
      <SafeAreaView style={style}>
        <CardList
          items={items}
          commentsForItem={commentsForItem}
          onPressComments={onPressComments}
        />
      </SafeAreaView>
    );
  }
}