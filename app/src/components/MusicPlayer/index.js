import React, { Component } from 'react';
// import * as testSound from "./music/Distorted Soul - Acid techno.mp3"
import threeEntryPoint from "./3rx/threeEntryPoint"
import './MusicPlayer.css'


class MusicPlayer extends Component {
  componentDidMount(){
    let context = new AudioContext();
    let audio = this.refs.audio;
    audio.crossOrigin = "anonymous";
    threeEntryPoint(this.threeRootElement, context, audio);
    // this.createVisualization()
  }
  render() {
    return (
      <div className="MusicPlayer">
        <h2>Distorted Soul - Cloud Dance.mp3</h2>
        <audio
            ref="audio"
            autoPlay={true}
            controls={true}
            src="/music/Distorted Soul - Cloud Dance.mp3"
            >
        </audio>
        <div ref={element => this.threeRootElement = element} />
        {/*<canvas
          ref="analyzerCanvas"
          id="analyzer"
        ></canvas>*/}
      </div>
    )
  }

  createVisualization(){
    let context = new AudioContext();
    let analyser = context.createAnalyser();
    let canvas = this.refs.analyzerCanvas;
    let ctx = canvas.getContext('2d');
    let audio = this.refs.audio;
    audio.crossOrigin = "anonymous";
    let audioSrc = context.createMediaElementSource(audio);
    audioSrc.connect(analyser);
    audioSrc.connect(context.destination);
    analyser.connect(context.destination);

    function renderFrame(){
        let freqData = new Uint8Array(analyser.frequencyBinCount)
        requestAnimationFrame(renderFrame)
        analyser.getByteFrequencyData(freqData)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#9933ff';
        let bars = 100;
        for (var i = 0; i < bars; i++) {
            let bar_x = i * 3;
            let bar_width = 2;
            let bar_height = -(freqData[i] / 2);
            ctx.fillRect(bar_x, canvas.height, bar_width, bar_height)
        }
    };
    renderFrame()
  }

}

export default MusicPlayer
