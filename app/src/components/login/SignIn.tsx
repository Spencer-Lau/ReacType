import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, Link as RouteLink } from 'react-router-dom';
import { SigninDark } from '../../../../app/src/public/styles/theme';
import {
  StyledEngineProvider,
  Theme,
  ThemeProvider
} from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LoginInt } from '../../interfaces/Interfaces';
import serverConfig from '../../serverConfig.js';
import makeStyles from '@mui/styles/makeStyles';
import { sessionIsCreated } from '../../helperFunctions/auth';
import {
  Divider,
  Box,
  Avatar,
  Button,
  Container,
  CssBaseline,
  Grid,
  TextField,
  Typography
} from '@mui/material';

const { API_BASE_URL } = serverConfig;

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © ReacType '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    backgroundColor: 'white'
  },
  form: {
    width: '100%'
  },
  submit: {
    cursor: 'pointer'
  },
  root: {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white'
    }
  }
}));

const SignIn: React.FC<LoginInt & RouteComponentProps> = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invalidUserMsg, setInvalidUserMsg] = useState('');
  const [invalidPassMsg, setInvalidPassMsg] = useState('');
  const [invalidUser, setInvalidUser] = useState(false);
  const [invalidPass, setInvalidPass] = useState(false);

  useEffect(() => {
    const githubCookie = setInterval(() => {
      window.api?.setCookie();
      window.api?.getCookie((cookie) => {
        if (cookie[0]) {
          window.localStorage.setItem('ssid', cookie[0].value);
          clearInterval(githubCookie);
          props.history.push('/');
        } else if (window.localStorage.getItem('ssid')) {
          clearInterval(githubCookie);
        }
      });
    }, 2000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;

    switch (e.target.name) {
      case 'username':
        setUsername(inputVal);
        break;

      case 'password':
        setPassword(inputVal);
        break;
    }
  };

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setInvalidUser(false);
    setInvalidUserMsg('');
    setInvalidPass(false);
    setInvalidPassMsg('');
    sessionIsCreated(username, password, false).then((loginStatus) => {
      if (loginStatus === 'Success') {
        props.history.push('/');
      } else {
        switch (loginStatus) {
          case 'No Username Input':
            setInvalidUser(true);
            setInvalidUserMsg(loginStatus);
            break;

          case 'No Password Input':
            setInvalidPass(true);
            setInvalidPassMsg(loginStatus);
            break;

          case 'Invalid Username':
            setInvalidUser(true);
            setInvalidUserMsg(loginStatus);
            break;

          case 'Incorrect Password':
            setInvalidPass(true);
            setInvalidPassMsg(loginStatus);
            break;
        }
      }
    });
  };

  const keyBindSignIn = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('SignIn').click();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', keyBindSignIn);
    return () => {
      document.removeEventListener('keydown', keyBindSignIn);
    };
  }, []);

  const handleLoginGuest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.localStorage.setItem('ssid', 'guest');
    props.history.push('/');
  };

  const handleGithubLogin = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.location.assign(`${API_BASE_URL}/auth/github`);
  };

  const classBtn =
    'MuiButtonBase-root MuiButton-root MuiButton-contained makeStyles-submit-4 MuiButton-fullWidth';

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={SigninDark}>
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            marginTop: '10vh'
          }}
        >
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar} sx={{ margin: '2vh' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="h1"
              variant="h5"
              color="textPrimary"
              sx={{ marginBottom: '10px' }}
            >
              Log in
            </Typography>
            <TextField
              className={classes.root}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={handleChange}
              helperText={invalidUserMsg}
              error={invalidUser}
              data-testid="username-input"
            />
            <TextField
              className={classes.root}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handleChange}
              helperText={invalidPassMsg}
              error={invalidPass}
              data-testid="password-input"
            />

            <Button
              fullWidth
              id="SignIn"
              variant="contained"
              color="primary"
              onClick={(e) => handleLogin(e)}
              sx={{
                backgroundColor: '#2997ff',
                marginBottom: '5px',
                marginTop: '20px',
                textTransform: 'none',
                fontSize: '1rem',
                '$:hover': {
                  cursor: 'pointer'
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-person-check"
                viewBox="0 0 16 16"
                style={{ marginLeft: '5px' }}
              >
                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z" />
              </svg>
              Log In
            </Button>

            <Divider sx={{ color: 'gray', margin: '1rem', zIndex: '1500' }}>
              OR
            </Divider>

            <Typography
              className="other-options"
              fullWidth
              id="SignInWithGithub"
              variant=""
              onClick={(e) => handleGithubLogin(e)}
              sx={{
                marginBottom: '1rem',
                textTransform: 'none',
                fontSize: '1rem',
                color: 'white',
                '$:hover': {
                  cursor: 'pointer',
                  color: 'black',
                  textDecoration: 'underline'
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-github"
                viewBox="0 0 16 16"
                style={{ marginLeft: '5px' }}
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Sign In With Github
            </Typography>
            <Typography
              className="other-options"
              fullWidth
              variant="contained"
              color="primary"
              id="SignInWithGoogle"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign(`${API_BASE_URL}/auth/google`);
              }}
              sx={{
                marginBottom: '1rem',
                textTransform: 'none',
                fontSize: '1rem',
                color: 'white',
                '$:hover': {
                  cursor: 'pointer',
                  color: 'black'
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-google"
                viewBox="0 0 16 16"
                style={{ marginLeft: '5px' }}
              >
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
              </svg>
              Sign in With Google
            </Typography>
            <Typography
              fullWidth
              variant=""
              className="other-options"
              color="primary"
              onClick={(e) => handleLoginGuest(e)}
              sx={{
                marginBottom: '1rem',
                textTransform: 'none',
                fontSize: '1rem',
                color: 'white',
                '$:hover': {
                  cursor: 'pointer',
                  color: 'black'
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-person-circle"
                viewBox="0 0 16 16"
                style={{ marginLeft: '5px' }}
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                />
              </svg>
              Continue as Guest
            </Typography>
            <RouteLink
              style={{ color: '#aaaaaa' }}
              to={`/signup`}
              className="nav_link"
            >
              Forgot password?
            </RouteLink>

            <RouteLink
              style={{ color: '#aaaaaa' }}
              to={`/signup`}
              className="nav_link"
            >
              <span>
                Don't have an account?
                <span className="blue-accent-text"> Sign Up</span>
              </span>
            </RouteLink>
          </div>
          <Box mt={8}>
            <Copyright />
          </Box>
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default SignIn;
