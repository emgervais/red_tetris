import React from 'react';
import PropTypes from 'prop-types';

export const Cell = ({ type }) => {
  return (
    <div className={`cell ${type}`} />
  );
};

Cell.propTypes = {
  type: PropTypes.string.isRequired,
};
