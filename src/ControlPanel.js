import ControlPanel, {
  Checkbox,
  Select,
  Text,
  Range
} from "react-control-panel";
import React from "react";
import globals from "./app/globals";
import { toggleLock, changeLatitude } from "./app/UI";

/**
 * TODO:
 * - Manage global state centrally (including in app),
 * to get updates from App
 * - Complete port of planet chooser (include custom panel)
 * - Make the text fields into plain labels
 */

const planets = {
  Earth: {
    tilt: 23.4,
    numDays: 365,
    radius: 200
  },
  Uranus: {
    tilt: 97.4,
    numDays: 84.323 * 365,
    radius: 200
  },
  B612: {
    tilt: 0,
    numDays: 100,
    radius: 10
  }
};

class ControlPanelContainer extends React.Component {
  state = {
    "Lock camera": false,
    Planet: "Earth",
    "Speed (seconds/day)": 60,
    Date: new Date(),
    Latitude: 0,
    Longitude: 0,
    "Sun Elevation": 0,
    Sunrise: "4:00:00 AM",
    Sunset: "4:00:00 PM"
  };

  onChange(label, newValue) {
    switch (label) {
      case "Lock Camera":
        toggleLock();
        break;
      case "Planet":
        globals.currentPlanet = planets[newValue];
        break;
      case "Speed (seconds/day)":
        globals.animation.x_s = newValue;
        break;
      case "Latitude":
        changeLatitude(newValue);
        break;
      default:
        break;
    }
  }

  render() {
    return <MyPanel state={this.state} onChange={this.onChange.bind(this)} />;
  }
}

const MyPanel = ({ state, onChange }) => (
  <ControlPanel
    theme="dark"
    title="Controls"
    initialState={state}
    onChange={onChange}
    width={500}
    style={{ marginRight: 30, position: "absolute" }}
  >
    <Checkbox label="Lock camera" />
    <Select label="Planet" options={Object.keys(planets)} />
    <Range label="Speed (seconds/day)" min={1} max={300} />
    <Text label="Date" />
    <Range label="Latitude" min={-90} max={90} />
    <Text label="Longitude" />
    <Text label="Sun Elevation" />
    <Text label="Sunrise" />
    <Text label="Sunset" />
  </ControlPanel>
);

export default ControlPanelContainer;
