import React, { Component } from "react";
// import hash from "./hash";
import "./App.css";
import {UserBar} from "./Components/UserProfile"
import GetRecommendations from "./Components/GetRecommendations"
import TopTracks from "./Components/TopTracks";
import 'bootstrap/dist/css/bootstrap.css'
import {Container} from 'react-bootstrap'
import {getRecommendations, getTopTracks, getUserInfo} from './Helper/Data'


export const authEndpoint = 'https://accounts.spotify.com/authorize';
// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "2badfb5ce5af4cf3840edb1968683fdf";
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-top-read",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-library-read"
];
// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = "";
class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      token: null,
      user: {
        display_name: "",
        external_urls: {},
        images:[{url:""}]
      },
      topTracks:{
        items: [{
          artists:[{
            id:"",
            name:""
          }],
          id: "",
          external_urls:{},
          genres:[],
          name:""
        }]
      },
      
      topArtists:{
        items: [{
          id: "",
          external_urls:{},
          genres:[],
          name:""
        }]
      },
      recommendations:{
        tracks:[{
          album:{
            images:[{
              height:"",
              url:"",
              width:"",
            }]
          },
          artists:[{
            external_urls:{},
            id:"",
            name:""
          }],
          external_urls:{},
          id:"",
          name:"",

        }]
      },
      player:{
        item: {
          album: {
            images: [{ url: "" }]
          },
          name: "",
          artists: [{ name: "" }],
          duration_ms:0,
        },
        is_playing: "Paused",
        progress_ms: 0
      }
    };
    this.authUser = this.authUser.bind(this);
    this.checkToken = this.checkToken.bind(this);
  }

  checkToken(){
    const startTime = localStorage.getItem('sDate');
    const currentTime = new Date().getTime();
    const expDuration = 3600*1000;
    const notAccepted = startTime === undefined;
    const isExpired = startTime !== undefined && (currentTime - startTime) >expDuration;
    console.log("Testing token: "+startTime+" Curr time: "+currentTime+" Diff: "+ (currentTime-startTime))
    if( notAccepted || isExpired){
      localStorage.removeItem('sDate');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('user_top_tracks');
      return false;
    }else{
      return true;
    }
  }

  authUser(){
    window.location.replace(`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token`);
  }


  async componentDidMount() {
    // Set token
    var tokenValid = this.checkToken();
    var _token;
    if(tokenValid)
      _token = localStorage.getItem('access_token');
    else{
      _token = hash.access_token;
      if (_token) {
        localStorage.setItem('sDate',new Date().getTime());
        localStorage.setItem('access_token',_token);
      }
    }
    if(_token !== undefined){
      this.setState({
        token: _token
      });
      const user = await getUserInfo(_token);
      this.setState({
        user: user,
      });
      const topTracks= await getTopTracks(_token);
      this.setState({
        topTracks: topTracks,
      });
      const recommendations = await getRecommendations(_token,topTracks);
      this.setState({
        recommendations: recommendations
      });
    }
  }
render() {
  return (
    <Container className="App">
      {!this.state.token &&(
        <button type="button" className="btn btn-primary" onClick={this.authUser}>
          Login to Spotify
        </button>
      )}
      {this.state.token &&(
        <div>
          <UserBar user={this.state.user}/>
          <GetRecommendations recommendations={this.state.recommendations}/>
          <TopTracks topTracks={this.state.topTracks}/>
        </div>
      )}
    </Container>
  );
  }
}
export default App;