import { Stack, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import { RootState } from '../../redux/store';
import TextField from '@mui/material/TextField';
import { allCooperativeState } from '../../redux/reducers/slice/appStateSlice';
import {
  setRoomCode,
  setUserName,
  setUserJoined,
  setUserList
} from '../../redux/reducers/slice/roomSlice';
import { codePreviewCooperative } from '../../redux/reducers/slice/codePreviewSlice';
import config from '../../../../config';
import { cooperativeStyle } from '../../redux/reducers/slice/styleSlice';
// websocket front end starts here
import { io } from 'socket.io-client';
import store from '../../redux/store';
//pasted from navbarbuttons
import debounce from '../../../../node_modules/lodash/debounce.js';

// // for websockets
// // Part  - join room and room code functionality
let socket;

//function to create HTML elements and update the position of the cursorr.
function getCursor(id) {
  let elementId = 'cursor-' + id;
  let element = document.getElementById(elementId);
  if (element == null) {
    element = document.createElement('div');
    element.id = elementId;
    element.className = 'cursor';
    document.appendChild(element);
  }
  return element;
}

const { API_BASE_URL } = config;
const RoomsContainer = () => {
  const dispatch = useDispatch();
  //roomCode/userName for emiting to socket io, userList for displaying user List receiving from back end, userJoined fo conditional rendering between join and leave room.
  const roomCode = useSelector((store: RootState) => store.roomSlice.roomCode);
  const userName = useSelector((store: RootState) => store.roomSlice.userName);
  const userList = useSelector((store: RootState) => store.roomSlice.userList);
  const userJoined = useSelector(
    (store: RootState) => store.roomSlice.userJoined
  );

  function initSocketConnection(roomCode: string) {
    if (socket) socket.disconnect(); //edge case check if socket connection existed
    //establishing client and server connection
    socket = io(API_BASE_URL, {
      transports: ['websocket']
    });

    //connecting user to server
    socket.on('connect', () => {
      socket.emit('joining', userName, roomCode);
      console.log(`${userName} Joined room ${roomCode}`);
    });

    //send state from host to room when new user joins
    socket.on('requesting state from host', (callback) => {
      //getting state request from user from back end
      const newState = store.getState();
      callback(newState); //pull new state from host and send it to back end
    });

    socket.on('server emitting state from host', (state, callback) => {
      //getting state from host once joined a room
      //dispatching new state to change user current state
      store.dispatch(allCooperativeState(state.appState));
      store.dispatch(codePreviewCooperative(state.codePreviewCooperative));
      store.dispatch(cooperativeStyle(state.styleSlice));
      callback({ status: 'confirmed' });
    });

    //listening to back end for updating user list
    socket.on('updateUserList', (newUserList: object) => {
      dispatch(setUserList(Object.values(newUserList)));
    });

    //listening to back end for mouse cursor movement
    socket.on('draw_cursor', (data) => {
      let el = getCursor(data.id);
      el.style.x = data.line[0].x;
      el.style.y = data.line[0].y;
    });

    // receiving the message from the back end
    socket.on('new state from back', (event) => {
      const currentStore = JSON.parse(JSON.stringify(store.getState()));
      const newState = JSON.parse(event);

      const areStatesEqual = (stateA, stateB) =>
        JSON.stringify(stateA) === JSON.stringify(stateB);

      //checking if current state are equal to the state being sent from server
      if (!areStatesEqual(currentStore, newState)) {
        if (!areStatesEqual(currentStore.appState, newState.appState)) {
          store.dispatch(allCooperativeState(newState.appState));
        } else if (
          !areStatesEqual(
            currentStore.codePreviewSlice,
            newState.codePreviewCooperative
          )
        ) {
          store.dispatch(
            codePreviewCooperative(newState.codePreviewCooperative)
          );
        } else if (
          !areStatesEqual(currentStore.styleSlice, newState.styleSlice)
        ) {
          store.dispatch(cooperativeStyle(newState.styleSlice));
        }
      }
    });
  }

  function handleUserEnteredRoom(roomCode) {
    initSocketConnection(roomCode);
  }

  let previousState = store.getState();
  console.log('previousState:', previousState);
  // sending info to backend whenever the redux store changes
  //handling state changes and send to server
  const handleStoreChange = debounce(() => {
    const newState = store.getState();
    const roomCode = newState.roomSlice.roomCode;

    if (JSON.stringify(newState) !== JSON.stringify(previousState)) {
      // Send the current state to the server
      socket.emit('new state from front', JSON.stringify(newState), roomCode);
      previousState = newState;
    }
  }, 100);

  //listening to changes from store from user, invoke handle store change.
  store.subscribe(() => {
    if (socket) {
      handleStoreChange();
    }
  });

  //joining room function
  function joinRoom() {
    if (userList.length !== 0) dispatch(setUserList([])); //edge case check if userList not empty.
    handleUserEnteredRoom(roomCode); // Call handleUserEnteredRoom when joining a room
    dispatch(setRoomCode(roomCode));
    dispatch(setUserJoined(true)); //setting joined room to true for rendering leave room button
  }

  function leaveRoom() {
    if (socket) {
      socket.disconnect(); //disconnecting socket from server
    }
    //reset all state values
    dispatch(setRoomCode(''));
    dispatch(setUserName(''));
    dispatch(setUserList([]));
    dispatch(setUserJoined(false)); //setting joined to false so join room UI appear
  }

  //checking empty input field (not including spaces)
  function checkInputField(...inputs) {
    let userName: string = inputs[0].trim();
    let roomCode: string = inputs[1].trim();
    return userName.length === 0 || roomCode.length === 0;
  }

  return (
    <div>
      <Stack //stack styling for container
        spacing={2}
        sx={{
          paddingTop: '20px',
          maxWidth: '230px',
          alignItems: 'center',
          margin: '0 auto 0 auto'
        }}
      >
        {' '}
        {/* live room display */}
        <Typography variant="h5" color={'white'}>
          Live Room: {roomCode}
        </Typography>
        {/*  Set up condition rendering depends on if user joined a room then render leave button if not render join button */}
        {userJoined ? (
          <>
            <Button
              variant="contained"
              onClick={() => leaveRoom()}
              sx={{
                backgroundColor: '#ffffff',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#C6C6C6',
                  borderColor: '#0062cc'
                }
              }}
            >
              {' '}
              Leave Room{' '}
            </Button>
            <Typography
              variant="body1"
              sx={{
                color: 'white' // Text color for the count
              }}
            >
              Users: {userList.length}
            </Typography>
            {/* User count inside the box */}
            <Box
              sx={{
                width: '100%',
                height: 300,
                maxWidth: 200,
                bgcolor: '#333333',
                border: '3px solid white',
                borderRadius: '5%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'auto',
                color: 'white'
              }}
            >
              {/* User count inside the box */}
              <List
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {userList.map((user, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      color: 'white',
                      textAlign: 'center',
                      width: '100%'
                    }}
                  >
                    <ListItemText
                      primary={`${index + 1}. ${
                        index === 0 ? `${user} (host)` : user
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        ) : (
          //after joinning room
          <>
            <TextField
              hiddenLabel={true}
              id="filled-hidden-label-small"
              variant="filled"
              size="small"
              value={userName}
              placeholder="Input Nickname"
              onChange={(e) => dispatch(setUserName(e.target.value))}
            />
            <TextField
              hiddenLabel={true}
              id="filled-hidden-label-small"
              variant="filled"
              size="small"
              value={roomCode}
              placeholder="Input Room Number"
              onChange={(e) => dispatch(setRoomCode(e.target.value))}
            />
            <Button
              variant="contained"
              disabled={checkInputField(userName, roomCode)}
              onClick={() => joinRoom()}
              sx={{
                backgroundColor: '#ffffff',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#C6C6C6',
                  borderColor: '#0062cc'
                }
              }}
            >
              Join Room
            </Button>
            {/* Note about Collab room feature */}
          </>
        )}
        <Typography
          variant="body2"
          color="white" // Use a color that signifies a warning or important information
          sx={{
            marginTop: '10px',
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: 'smaller'
          }}
        >
          Note: For the best experience, limit Collab room occupancy to 3
          people. Exceeding this limit may lead to app performance issues.
        </Typography>
      </Stack>
    </div>
  );
};

export default RoomsContainer;
