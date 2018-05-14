import { FlatList } from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import Card from './Card';

const keyExtractor = ({ id }) => id;

export default class CardList extends React.Component {

  renderItem = ({ item: { id, author } }) => {
    const { commentsForItem, onPressComments } = this.props;
    const comments = commentsForItem[id];

    return (
      <Card
        fullname={author}
        image={{
          uri: 'https://unsplash.it/600/600',
        }}
        linkText={`${comments ? comments.length : 0} Comments`}
        onPressLinkText={() => onPressComments(id)}
      />
    );
  };
  
  render() {
    const { items, commentsForItem } = this.props;
    return (
      <FlatList
        data={items} renderItem={this.renderItem} keyExtractor={keyExtractor}
        extraData={commentsForItem}
      />
    );
  }
}