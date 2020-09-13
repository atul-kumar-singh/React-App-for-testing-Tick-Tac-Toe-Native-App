# Realtime Tic Tac Toe React App

This React app is used to test the [React Native version](https://github.com/atul-kumar-singh/React-Native-Tick-Tac-Toe) of this tic tac toe game. In the React Native app, players will be able to create unqiue game channels where others players can join (total of 2 players per channel room). In this React app, players will only be join a game channel that was created by another player. 


NOTE: This app cannot run on its on without running the [React Native app](https://github.com/ocastroa/react-native-tictactoe).

## Setup
1) Clone the repo.
```bash
https://github.com/ocastroa/react-native-tictactoe
```

2)  Go to the file Game.js and replace 'ENTER_YOUR_PUBLISH_KEY_HERE' and 'ENTER_YOUR_SUBSCRIBE_KEY_HERE' with the SAME Pub/Sub API keys you used for the React Native tic tac toe game.

3) Run the following command in the terminal to install the dependencies:
```bash
npm install
```

4) To run the app, type the following command in the terminal:
```bash
npm start
```

5) The app will open in http://localhost:3000 with an empty table and two input fields. Make sure you have the React Native app set up and running on a simulator or emualtor. 

6) Go to the simulator/emulator and in the lobby, type Player X for the username and press the “Create” button to create a new room id. Go back to the browser and for the username field, type Player O. In the room name field, type the room id that was created in the simulator.

8) Once both fields are filled in, press the Submit button and the game will start for both players. Since the simulator/emulator is the room creator, press any square on the table to place an X. In the browser, press any square to place an O.


