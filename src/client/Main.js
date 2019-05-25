import React from 'react'
import Navbar from './components/Navbar/Navbar';
import MainContent from './components/MainContent/MainContent';


export default () => <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
  <Navbar steps={[
    {
      active: true,
      completed: true,
      title: 'Media',
      description: 'Choose media',
    },{
      active: false,
      disabled: true,
      title: 'TV',
      description: 'Choose TV to cast',
    },{
      active: false,
      disabled: true,
      title: 'Play',
      description: 'Control media cast',
    }
  ]} />
  <MainContent/>
</div>
