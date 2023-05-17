const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const colormap = require("colormap");
const eases = require("eases");

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

let audio, colors1, colors2;
let audioContext, audioData, sourceNode, analyserNode;
let manager;
const styles = [];

const sketch = ({ width, height }) => {
  const mask = {
    radius: width * 0.35,
    sides: 4,
    x: width * 0.5,
    y: height * 0.5
  };

  return ({ context, frame }) => {
    if(!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);
    
    const firstBucket = audioData[0] > -58;
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(mask.x, mask.y);
    const radius = firstBucket ? mask.radius +  random.range(25, 50) : mask.radius;
    // const radius = mask.radius;

    drawPoligon({ context, radius, sides: mask.sides + 40 });

    context.clip();
    context.save();
    context.translate(-mask.x, -mask.y);

    let mapped, lineHeight, lineDash;    
    const isColorInverted = audioData[7] > -40;

    for(let i = 0; i < audioData.length; i += 5) {
      const style = styles[i];
      const isEven = i % 2;
      const x = mapped = math.mapRange(i, 0, audioData.length, 120, width - 120, true);
      const y = isEven ? 0 : height;
  
      context.lineWidth = audioData[249] > -64.5 ?  [random.range(3, 5)] : style.lineWidth;
      mapped = math.mapRange(audioData[i], -190, analyserNode.maxDecibels, 0, 1, true);
      lineHeight = isEven ? mapped * height * 0.7 : mapped * height * 0.9;
      lineDash = audioData[249] > -64.5 ?  [random.range(5, 15)] : style.lineDash;
      
      context.beginPath();
      context.setLineDash(lineDash);
      context.moveTo(x, y);
      // if(audioData[249] > -64.5)  lineHeight = isEven ? mapped * height : mapped * height;
      context.lineTo(x, lineHeight);
      context.strokeStyle = isEven ? colors1[i] : colors2[i];
      
      if(isColorInverted) context.strokeStyle = !isEven ? colors1[i] : colors2[i];
    
      context.stroke();
    }


    context.restore();
    context.restore();
  };
};

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if(!audioContext) createAudio();

    if(audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    }
  });
}

const createAudio = () => {
  audio = document.createElement('audio');
  audio.src = 'audio/Rhinoceros.mp3';

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.smoothingTimeConstant = 0.7;
  sourceNode.connect(analyserNode);

  audioData = new Float32Array(analyserNode.frequencyBinCount);

  colors1 = colormap({
    colormap: "cool",
    nshades: audioData.length
  });

  colors2 = colormap({
    colormap: "cubehelix",
    nshades: audioData.length
  });

  for(let i = 0; i < audioData.length; i++) {
    styles.push({ lineWidth: 4, lineDash: [5] })
  }
}

const getAvg = (data) => data.reduce((acc, sData) => acc + sData, 0) / data.length;

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
}

const drawPoligon = ({ context, radius = 100, sides = 3 }) => {
  const slice = (Math.PI * 2) / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for (let i = 0; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }

  context.closePath();
};

start();
