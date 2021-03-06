import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import './App.css';
import 'tachyons';

const initialState = {
  input: '',
  imageUrl: '',
  faceRegions: [],
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '', 
    entries: 0,
    joined: ''
  }
}



class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email, 
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calculateFaceLocations = (data) => {
    return data.outputs[0].data.regions.map(face => {
      const clarifaiFace = face.region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
    })
  }

  displayFaceRegions = (regions) => {
    this.setState({faceRegions: regions})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://shrouded-wave-31054.herokuapp.com/imageurl', {
            method: 'post', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
        })
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('https://shrouded-wave-31054.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
      }
      this.displayFaceRegions(this.calculateFaceLocations(response))
    })
    .catch(err => console.log(err))
  }

  onRouteChange = (route) => {
    if (route==='home'){
      this.setState({isSignedIn: true})
    } else if (route === 'signout') {
      this.setState(initialState)
    }
    this.setState({route: route})
  }

  renderSwitch = (route) => {
    switch(route){
      case 'home':
        return <div>
          <Logo/>
          <Rank name={this.state.user.name} entries={this.state.user.entries} />
          <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition faceRegions={this.state.faceRegions} imageUrl={this.state.imageUrl}/>
        </div>
      case 'signin':
      case 'signout':
        return <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      case 'register':
        return <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      default:
        return;
    }
  }

  render() {
    return(
      <div className="App">
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
        {this.renderSwitch(this.state.route)}
      </div>
    )
  }
}

export default App;
