import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { main } from "./app/draw";

class App extends Component {
  componentDidMount() {
    main();
  }

  render() {
    return (
      <div className="App">
        <canvas id="webgl" width="800" height="600" tabindex="1">
          Please use a browser that supports "canvas"
        </canvas>
      </div>
    );
  }
}

export default App;
