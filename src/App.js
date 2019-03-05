import React, { Component } from "react";
import "./App.css";
import { main } from "./app/draw";
import ControlPanel from "./ControlPanel";

class App extends Component {
  componentDidMount() {
    main();
  }

  render() {
    return (
      <div className="App">
        <ControlPanel />
        <canvas id="webgl" width="800" height="600" tabindex="1">
          Please use a browser that supports "canvas"
        </canvas>
      </div>
    );
  }
}

export default App;
