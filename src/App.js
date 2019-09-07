import React, { Component } from "react";
// import hash from "./hash";
import axios from 'axios'
import "./App.css";
import {UserBar} from "./Components/UserProfile"
import GetRecommendations from "./Components/GetRecommendations"
import * as $ from "jquery";
import Player from "./Player";
import TopTracks from "./Components/TopTracks";
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
console.log(window.location.hash)
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
    this.getUserInfo = this.getUserInfo.bind(this);
    this.getRecommendations = this.getRecommendations.bind(this);
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  getUserInfo(token){
    axios.get(
      'https://api.spotify.com/v1/me' ,{headers: { Authorization: 'Bearer '+token}}
      ).then(res => {
        console.log(res)
        this.setState({
          user: res.data
        });
      });
  }

  getTopTracks(token){
    axios.get(
      'https://api.spotify.com/v1/me/top/tracks' ,{headers: { Authorization: 'Bearer '+token}}
      ).then(res => {
        console.log(res)
        this.setState({
          topTracks: res.data
        },()=>{
          this.getRecommendations(token);
        });
      });
  }

  getTopArtists(token){
    axios.get(
      'https://api.spotify.com/v1/me/top/artists' ,{headers: { Authorization: 'Bearer '+token}}
      ).then(res => {
        console.log(res)
        this.setState({
          topArtists: res.data
        });
      });
  }

  getRecommendations(token){
    // console.log(this.state.topArtists.items[0])
    axios.get(
      'https://api.spotify.com/v1/recommendations',{headers: { Authorization: 'Bearer '+token},
      params:{
        // market:"US",seed_artists:this.state.topTracks.items[0].artists[0].id,
      // +','+
      // this.state.topTracks.items[1].artists[0].id+','+
      // this.state.topTracks.items[2].artists[0].id+','+
      // this.state.topTracks.items[3].artists[0].id+','+
      // this.state.topTracks.items[4].artists[0].id,
      // seed_genres:this.state.topArtists.items[0].genres[0],
      // +','+
      // this.state.topArtists.items[1].genres[0]+','+
      // this.state.topArtists.items[2].genres[0]+','+
      // this.state.topArtists.items[3].genres[0]+','+
      // this.state.topArtists.items[4].genres[0],
      seed_tracks:this.state.topTracks.items[0].id+','+
      this.state.topTracks.items[1].id+','+
      this.state.topTracks.items[2].id+','+
      this.state.topTracks.items[3].id+','+
      this.state.topTracks.items[4].id
    }}
      ).then(res => {
        console.log(res)
        this.setState({
          recommendations: res.data
        });
      },err=>{
        console.log(err)
      });
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    axios.get(
      'https://api.spotify.com/v1/me/player' ,{headers: { Authorization: 'Bearer '+token}}
      ).then(res => {
        console.log(res)
        // this.setState({
        //   item: res.data.item,
        //   is_playing: res.data.is_playing,
        //   progress_ms: res.data.progress_ms,
        // });
      });
  }

  componentDidMount() {
    // Set token
    let _token = hash.access_token;
    if (_token) {
      console.log(_token)
      this.getUserInfo(_token);
      this.getTopTracks(_token);

      // this.getTopTracks(_token);
      // Set token
      this.setState({
        token: _token
      });
    }
  }
render() {
  return (
    <div className="App">
      {!this.state.token &&(
        <a
          className="btn btn--loginApp-link"
          href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token`}
        >
          Login to Spotify
        </a>
      )}
      {this.state.token &&(
        <div>
          <h3>Welcome, </h3>
          <UserBar user={this.state.user}/><br />
          <TopTracks topTracks={this.state.topTracks}/>
          <GetRecommendations recommendations={this.state.recommendations}/>
        {/* <Player
          item={this.state.item}
          is_playing={this.state.is_playing}
          progress_ms={this.progress_ms}
        /> */}
        </div>
      )}
    </div>
  );
  }
}
export default App;