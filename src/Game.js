import React from 'react';
import Board from './Board';
import PubNubReact from 'pubnub-react';

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winnerRow: lines[i] };
    }
  }

  return { winner: null, winnerRow: null };
};

const getLocation = (move) => {
  const locationMap = {
    0: {row: 0, col: 0},
    1: {row: 0, col: 1},
    2: {row: 0, col: 2},
    3: {row: 1, col: 0},
    4: {row: 1, col: 1},
    5: {row: 1, col: 2},
    6: {row: 2, col: 0},
    7: {row: 2, col: 1},
    8: {row: 2, col: 2},
  };

  return locationMap[move];
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
      publishKey: "pub-c-2044f59d-6d75-4c29-b4da-dd0f156e4318", 
      subscribeKey: "sub-c-b4bf70d0-d47a-11ea-9485-d6b39d8ad52f",  
    });
    this.state = {
      squares: Array(9).fill(''),
      myTurn: false,
      username: '',
      is_playing: false,
      is_waiting: false,
      is_room_creator: false,
      value: '',
      input: '',
      isDisabled: false
    };

    this.channel = null;

    this.room_id = null;
    this.pubnub.init(this);
    this.turn = 'X';
    this.piece = 'O';

    this.ids = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8]
		];

  }

  componentWillUnmount(){
    this.pubnub.unsubscribe({
      channels : [this.channel]
    });
  }

  componentWillMount(){
    this.pubnub.subscribe({
      channels: ['gameLobby'],
      withPresence: true
    });
    this.pubnub.getMessage('gameLobby', (msg) => {
      console.log("msg component will mount react project value is " , msg);
      if(msg.message.not_room_creator){    
        this.pubnub.unsubscribe({
          channels : ['gameLobby']
        }); 
        this.setState({
          is_waiting: false,
          is_playing: true,
        });  
      } 
    });
  }

  componentDidUpdate(){
    this.pubnub.getMessage(this.channel, (msg) => {
      console.log("did update is getting called react projevct " , msg);
      if(msg.message.reset || msg.message.gameOver){
        this.setState({
          squares: Array(9).fill(''),
          myTurn: false
        });

        this.turn = 'X';
        this.setState({isDisabled: false});
      }

			if(msg.message.piece === 'X'){
        this.convertToCoords(msg.message.row, msg.message.col);
      }
    });
  }

  convertToCoords = (row, col) => {
    let getSquare = this.ids[row][col];
    this.putOnBoard(getSquare);
  }

  componentDidMount() {
    console.log("this is called ") ;
    this.pubnub.subscribe({
      channels: ['gameLobby'],
      withPresence: true
    });

    this.pubnub.getMessage('gameLobby', (msg) => {
      // Set username for Player X
      console.log("msg is react project " , msg);
    });
  }

  joinRoom = () => {
    this.channel = 'tictactoe--' + this.state.input;
    
    // Check the number of people in the channel
    this.pubnub.hereNow({
      channels: [this.channel], 
    }).then((response) => {
      console.log("response from joining room is " , response); 
        if(response.totalOccupancy < 2){
          this.pubnub.subscribe({
            channels: [this.channel],
            withPresence: true
          });
          
          this.pubnub.publish({
            message: {
              readyToPlay: true,
              not_room_creator: true,
              username: this.state.username,
              total_players_count: 2
            },
            channel: 'gameLobby'
          });
          this.setState({
            is_waiting: true
          });
        }
        // if(response.totalOccupancy === 2){
        //   this.pubnub.subscribe({
        //     channels: [this.channel],
        //     withPresence: true
        //   });
          
        //   this.pubnub.publish({
        //     message: {
        //       readyToPlay: false,
        //       not_room_creator: true,
        //       username: this.state.username,
        //       total_players_count: 2
        //     },
        //     channel: 'gameLobby'
        //   });    
        // } 
        // if(response.totalOccupancy === 3){
        //   this.pubnub.subscribe({
        //     channels: [this.channel],
        //     withPresence: true
        //   });
          
        //   this.pubnub.publish({
        //     message: {
        //       readyToPlay: true,
        //       not_room_creator: true,
        //       username: this.state.username,
        //       total_players_count: 3
        //     },
        //     channel: 'gameLobby'
        //   });
      
        //   this.setState({
        //     is_waiting: true,
        //   });     
        // } 
        else{
          console.log('lobby full')
        }
    }).catch((error) => { 
        console.log(error)
    });
  }

  handleChange = (event) => {
    this.setState({input: event.target.value});
  }

  handleSubmit = (event) => {
    if(this.state.username === ''){
      alert('Username field is empty.');
    }

    else if(this.state.input === ''){
      alert('Enter the room name.');
    }

    else{
      this.setState({isDisabled: true});
      this.joinRoom();
    }
  }

  addUsername = (event) => {
    this.setState({username: event.target.value});
  }

  putOnBoard(i) {
    const squares = this.state.squares;

    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.myTurn ? 'O' : 'X';
    this.turn = (squares[i] === 'X')? 'O' : 'X';
    this.setState({
      squares: squares,
      myTurn: !this.state.myTurn,
    });
  }

  handleClick(i) {
    if(!this.state.is_playing){
      return;
    }

    if(this.state.myTurn){
      const squares = this.state.squares;
  
      if (calculateWinner(squares).winner || squares[i]) {
        return;
      }
      squares[i] = 'O';
      this.setState({
        squares: squares,
        myTurn: !this.state.myTurn,
      });
  
      let temp = getLocation(i);
      let row = temp.row;
      let col = temp.col;  
      this.turn = (this.turn === 'O') ? 'X' : 'O';

      this.pubnub.publish({
        message: {
          row: row,
          col: col,
          piece: this.piece,
          is_room_creator: false,
          turn: this.turn
        },
        channel: this.channel
      });       
    }
  }

  render() {
    const { winner, winnerRow } = calculateWinner(this.state.squares);

    let status;
    if (winner) {
      status = `Winner ${winner}`;
    } 
    else {
      status = `Current player: ${this.state.myTurn ? 'O' : 'X'}`;
    }

    return (
      <div className="game">  
        <Board
          squares={this.state.squares}
          winnerSquares={winnerRow}
          onClick={i => this.handleClick(i)}
        />            

        <div className="game-info">
          <p>{status}</p> 
          <div>
            <input 
              type="text" 
              onChange={ this.addUsername } 
              placeholder="Enter your username"
              />
          </div>
          <div>
            <input 
              type="text" 
              onChange={ this.handleChange }
              placeholder="Enter the room name"
              />
            <input
              className="buttonClass"
              type="button"
              disabled={this.state.isDisabled}
              value="Submit"
              onClick={this.handleSubmit}
            />
          </div>
        </div>    
      </div>
    );
  }
}

export default Game;
