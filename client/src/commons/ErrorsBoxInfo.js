import React from 'react'
import isEmpty from '../validation/is-empty';

export default ({ errors, onHide }) => {
  return (
    <div style={{ paddingBottom: '1rem' }}>
    { !isEmpty( errors ) ? (
      <div className="notification is-danger content">
        <button className="delete" onClick={onHide}></button>
        <ul>
          {Object.keys(errors).map( key => (
            <li key={key}>{errors[key]}</li>
          ))}
        </ul>

      </div>  
    ) : null }
    </div>
    
  )
}
