import React from 'react';

interface RskLinkCardProps {
  title: string;
  description: string;
  link: string;
  icon: any;
  backgroundColor: string;
}

const RskLinkCard = (props: RskLinkCardProps) => {
  return (
    <div className='rsk-card'>
      <div className="card-content">
        <div className='card-info'>
          <div className='card-title'>{props.title}</div>
          <div className="card-description">{props.description} </div>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => window.open(props.link, '__blank')}
        >
          Read More
        </button>
      </div>
      <div className="card-icon">
        <div>{props.icon}</div>
      </div>
    </div>
  );
};

export default RskLinkCard;
