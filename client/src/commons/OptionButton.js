import React from 'react'
import PropTypes from 'prop-types';

const OptionButton = ({icon, label, onClick}) => {
  return (
    <div className='full-bordered button' onClick={onClick} style={{height: '80px', lineHeight: '40px', marginLeft: '3px'}} >
      <span className="icon">
        <i className={icon}></i>
      </span>
      <span>{label}</span>
    </div>
  )
}

Option.propTypes = {
  label : PropTypes.string.isRequired,
  icon : PropTypes.string.isRequired,
  onClick : PropTypes.func
}



export default OptionButton;


