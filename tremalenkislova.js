"use strict";

// Reference audiocontext api
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Names of main sound buffer
var source;

// Assign 0 time
const startTime = audioContext.currentTime;

// Setup nodes through which to route sound
const volume = audioContext.createGain();
var stage = audioContext.createConvolver();
const compressor = audioContext.createDynamicsCompressor();
// Volume for convolver -- just in case
const stageVolume = audioContext.createGain();

// Reference canvas api for visualisation
const soundVisualizer = document.getElementById("sound-visualisation");
const canvasContext = soundVisualizer.getContext("2d");

// Canvas data stuff
const intendedWidth = document.getElementById('visualisation').clientWidth;
soundVisualizer.setAttribute('width', intendedWidth);
const visualSelect = document.getElementById("visual");
var drawVisual;

// Get data for visualisation
const sounddata = audioContext.createAnalyser();
sounddata.minDecibels = -140;
sounddata.maxDecibels = 0;
sounddata.smoothingTimeConstant = 0.85;

const frequencies = new Uint8Array(sounddata.frequencyBinCount);
sounddata.getByteTimeDomainData(frequencies);

// Get fields in html
const soundChoice = document.getElementById("choosesound");
const soundStage = document.getElementById("choosestage");
const soundVolume = document.getElementById("choosevolume");
const soundSpeed = document.getElementById("choosespeed");
const soundStartStop = document.getElementById("startstop");
const soundVisualiserChoice = document.getElementById("choosevisualiser");

// Whether sound is currently playing -->
// Will toggle
var isPlaying = false

function stageGet(soundfile) {

    // GET sound impulse response for convolver node

    return new Promise(function (resolve, reject) {

        stage = audioContext.createConvolver()

        let xhr = new XMLHttpRequest();

        xhr.open('GET', `sounds/${soundfile}`, true);

        xhr.responseType = 'arraybuffer';

        xhr.onload = function() {

            if( xhr.status === 200 ) {

                var stageData = xhr.response;

                audioContext.decodeAudioData(stageData, function soundSecondary(buffer) {

                    let stageBuffer = buffer;

                    stage.buffer = stageBuffer;

                    // Connect convolver volume to convolver
                    stageVolume.connect(stage)

                    // && convolver to main volume
                    stage.connect(volume)

                    // Basic sound data
                    stage.loop = true
                    stage.normalize = true
                    stageVolume.gain.value = 1

                }, function(e){"Error with decoding audio data" + e.err});

            } else {

                // Regular non-network error message
                // like file not found or whatever
                reject(Error(`Sorry about that. There was an error -- ${xhr.statusText}`));

            }
        }
        xhr.onerror = function networkError () {

            // Network error message
            reject(Error('Sorry, there was a network error.'));

        }

        xhr.send();

    })
}

function soundGet(soundfile) {

    // GET main sound

    return new Promise(function (resolve, reject) {

        source = audioContext.createBufferSource()

        // Create new request
        let xhr = new XMLHttpRequest();

        // GET sound user chose
        xhr.open( 'GET', `sounds/${soundfile}`, true );

        // Set sound type for buffer
        xhr.responseType = 'arraybuffer';

        // Check whether request was successful
        xhr.onload = function check () {

            if( xhr.status === 200 ) {

                let soundData = xhr.response;

                audioContext.decodeAudioData( soundData, function soundMain(buffer) {

                    let newBuffer = buffer

                    source.buffer = newBuffer

                    // Do all of the main sound stuff,
                    // connecting nodes to nodes to nodes etc

                    // Connect sound to stage
                    source.connect(stage)

                    // Connect sound source to volume
                    source.connect(volume)

                    // Compress sound data together
                    volume.connect(compressor)
                    compressor.connect(sounddata)

                    // Connect sound data sounddata
                    sounddata.connect(audioContext.destination)

                    // Set playback speed to default of 100%
                    source.playbackRate.value = 1
                    // Change speed when slider moves
                    soundSpeed.addEventListener("change", function speed(){source.playbackRate.value = soundSpeed.value})

                    // Set volume to a default of 50%
                    volume.gain.value = 0.5
                    // Change volume when slider moves
                    soundVolume.addEventListener("change", function vol(){volume.gain.value = soundVolume.value})

                    source.loop = true

                    soundVisualisation()

                }, function(e){"Error with decoding audio data" + e.err})

            } else {

                // Regular non-network error message
                // like file not found or whatever
                reject(Error(`Sorry about that. There was an error -- ${xhr.statusText}`));

            }
        };
        xhr.onerror = function networkError () {

            // Network error message
            reject(Error('Sorry, there was a network error.'));

        }

        // Send response
        xhr.send();

        // Actually call the convolver function
        // To connect sound files together
        stageGet(soundStage.value)

    })
}

function soundVisualisation(){

    // Connect sound profile to canvas
    
    // Set dimensions to container size
    let WIDTH = soundVisualizer.width;
    let HEIGHT = soundVisualizer.height;

    // Basic canvas data properties --> size of data buffer
    sounddata.fftSize = 2048;
    let bufferLength = sounddata.fftSize;
    let dataArray = new Uint8Array(bufferLength);

    // Actual canvas container
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {

        // Drawing content in canvas container

        drawVisual = requestAnimationFrame(draw);

        // Get sound data and put it in the buffer
        sounddata.getByteTimeDomainData(dataArray);

        // Set background color to color of html page
        canvasContext.fillStyle = '#ECEFF1';
        canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

        // Size and color of the sine wave
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'rgb(90, 170, 224)';

        // Make the line
        canvasContext.beginPath();

        // Move line with respect to buffer data
        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {

            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT/2;

            if(i === 0) {
                canvasContext.moveTo(x, y);
            } else {
                canvasContext.lineTo(x, y);
            }

            x += sliceWidth;
        }

        // Actually set line position context to data stream
        canvasContext.lineTo(soundVisualizer.width, soundVisualizer.height/2);
        canvasContext.stroke();
    };

    // Obviously call the function to draw the stuff
    return draw();

}

function init() {

    isPlaying = !isPlaying

    // If state is 'stop' return 'start' && vice-a-versa
    if (isPlaying) {

        soundGet(soundChoice.value)
        source.start(startTime)
        return "Stop"

    } else {

        source.stop(startTime)
        return "Start"

    }
};
