function setupAudio() {
  var sampleRate = 44100;
  var c;
  var master;

  window.convertNote = function (note) {
    var noteName = note[0];
    var octave = note[1];
    var notes = {
      "A":  0,
      "A#": 1,
      "Bb": 1,
      "B":  2,
      "C":  3,
      "C#": 4,
      "Db": 4,
      "D":  5,
      "D#": 6,
      "Eb": 6,
      "E":  7,
      "F":  8,
      "F#": 9,
      "Gb": 9,
      "G":  10,
      "G#": 11,
      "Ab": 11
    };

    var note = notes[noteName];
    if (note == null) {
      throw new Error(noteName + " not a valid note name");
    }

    return note + octave * 12;

  };

  window.playSineFreq = function (freq, start, length) {
    length = length || 1;
    var fadeTime = 0.05;
    var amplitude = 0.3;
    var oscillator = c.createOscillator();
    var gain = c.createGain();
    oscillator.frequency.value = freq; // value in hertz
    oscillator.start(start);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.stop(start + length);
    oscillator.type = 'triangle';

    //Fade in
    gain.gain.setValueAtTime(0.01, start);
    gain.gain.exponentialRampToValueAtTime(amplitude, start + fadeTime);
    //Fade out
    gain.gain.setValueAtTime(amplitude, start + length - fadeTime);
    gain.gain.exponentialRampToValueAtTime(0.01, start + length);
  };

  window.playNote = function (noteNumber, start, length) {
    var freq = 440 * Math.pow(2, noteNumber / 12);
    playSineFreq(freq, start, length);
  };

  window.playNotes = function (notes, start, length) {
    notes.forEach(function (note) {
      playNote(convertNote(note), start, length);
    });
  };

  window.playRandomNote = function (notes, start, length) {
    var randomIndex = Math.floor(Math.random() * notes.length);
    var octaveShift = Math.random() > 0.5 ? 0 : -12;
    playNote(convertNote(notes[randomIndex]) + octaveShift, start, length);
  };

  window.playRandomNotes = function (notes, start, length, count) {
    var noteLength = length / count;
    for (var i = 0; i < count; i++) {
      playRandomNote(notes, start + i * noteLength, noteLength * 1.1);
    }
  };

  function setup() {
    c = new (window.AudioContext || window.webkitAudioContext)();

    master = c.createGain();
    master.gain.value = 0.5;

    master.connect(c.destination);

  }

  // for iOS - iOS won't do anything without user input
  setTimeout(function () {
    if (c.state != "running") {
      $("button").show();
    }

    $("button").click(function () {
      $(this).hide();
      playRandomChords();
    });
  }, 100);

  setup();
}

setupAudio();


var chords = [
  [["B", -2], ["B", 0], ["D", 0], ["F#", 0]],
  [["F#", -3], ["F#", -1], ["A#", 0], ["C#", 0], ["E", 0]],
  [["A", -2], ["A", 0], ["C#", 0], ["E", 0]],
  [["E", -3], ["E", -1], ["G#", -1], ["B", 0], ["E", 0]],
  [["G", -3], ["G", -1], ["B", 0], ["D", 0]],
  [["D", -3], ["D", -1], ["F#", -1], ["A", 0], ["D", 0]],
  [["E", -3], ["E", -1], ["G", -1], ["B", 0], ["E", 0]],
  [["F#", -3], ["F#", -1], ["A#", 0], ["C#", 0], ["E", 0]],
];

var chordsWithoutRoot = chords.map(function (chord) {
  return chord.slice(1);
});

function playRandomChords() {
  var chordLength = 2; // time to stay on each chord
  var repeats = 24; // number of repeats of whole chord pattern
  var notes = 3; // number of simultaneous random notes to play

  var repeatNumber = 0;
  function playRandomChordsLater() {
    var patternLength = chords.length * chordLength;
    var start = patternLength * repeatNumber;
    chordsWithoutRoot.forEach(function (chord, index) {
      var when = start + index * chordLength;
      for (var j = 0; j < notes; j++) {
        playRandomNotes(chord, when, chordLength, 11);
      }
    });

    repeatNumber++;
    if (repeatNumber < repeats) {
      // This is a hack for performance. Queue up the next set of notes
      // with setTimeout roughly a second before they're needed.
      setTimeout(playRandomChordsLater, (patternLength * 1000) - 1000);
    }
  }

  playRandomChordsLater();
}

function playLongChords() {
  var noteLength = 3;
  var repeats = 4;
  chords.forEach(function (chord, index) {
    for (var i = 0; i < repeats; i++) {
      var when = index * noteLength + chords.length * noteLength * i;
      playNotes(chord, when, noteLength + 0.1);
    }
  });
}

playRandomChords();
