import React, { useState } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import DataTable from './DataTable';
import Tree from './Tree';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

function DisplayContainer({ data, props }) {
  // "data" is referring to components from state - passed in from StateManagement
  // grabbing intialized state from App using UseContext
  const [currComponentState, setCurrComponentState] = useState([]);
  const [parentProps, setParentProps] = useState([]);
  const state = useSelector((store: RootState) => store.appState);

  let root = '';

  // check the canvasFocus
  // if canvasFocus is a root component, use that root component as "root"
  if (state.rootComponents.includes(state.canvasFocus.componentId)) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === state.canvasFocus.componentId) root = data[i].name;
    }
  } else if (state.projectType === 'Classic React') {
    // else default to the main root component (aka app or index depending on react vs next/gatsby)
    root = 'App';
  } else {
    root = 'index';
  }

  // root becomes default value of clickedComp
  const [clickedComp, setClickedComp] = useState(root);

  return (
    <div style={{ display: 'flex' }}>
      <Tree
        data={data}
        setCurrComponentState={setCurrComponentState}
        setParentProps={setParentProps}
        setClickedComp={setClickedComp}
      />
      <Divider orientation="vertical" variant="middle" flexItem />
      <Grid item style={{margin: '60px 0 0 20px'}}>
        <Typography
          style={{ color: 'white', marginBottom: '30px' }}
          variant="subtitle2"
          gutterBottom
          align="center"
        >
          Click on a component in the graph to see its state
        </Typography>
        <Typography
          style={{ color: 'white' }}
          variant="h6"
          gutterBottom
          align="center"
        >
          Total State for {clickedComp}
        </Typography>
        <DataTable
          currComponentState={currComponentState}
          setCurrComponentState={setCurrComponentState}
          parentProps={parentProps}
          setParentProps={setParentProps}
          props={props}
          clickedComp={clickedComp}
          data={data}
        />
      </Grid>
    </div>
  );
}
export default DisplayContainer;
