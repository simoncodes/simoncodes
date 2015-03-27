var loader = new widgets.Loader({
  message: "Downloading: 0%"
});

/*
	NEXT:
		- incorporate michael's browser detect?
		- submit to google chrome web store

*/

(function(Chart) {
  "use strict";
  // REMOVE BLANK CHARS FROM BEGINNING AND END OF STRING
  String.prototype.trim = function() {
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
  };

  var Simon = function() {
    var SELF = this,
      INPUTS = document.getElementById('content').getElementsByTagName('a'),
      SPEED = 250,
      SPACING = 200,
      PATTERN = [], // PATTERN TO PLAY
      NOTES = [70, 74, 75, 77, 82],
      LISTEN = true, // LINK EACH COLOR TO A NOTE
      RESPONSE = [], // USER PLAYBACK
      CTRL = document.getElementById('ctrl'),
      SCORE = 0,
      SCOREKEEPER = document.getElementById('scoreNumber'), // CONTROL BAR
      DISTRACTCOUNTER = [];


    this.init = function() {
      var reset = document.getElementById('reset'),
        start = document.getElementById('start');
      // connect color to sound
      for (var i = 0; i < INPUTS.length; i++) {
        Event.add(INPUTS[i], 'mousedown', function(event) {
          SELF.inputSingle(event.target);
        });
      }
      document.getElementById('intro').className = 'active';
      reset.onclick = function() {
        return false;
      };
      start.onclick = function() {
        return false;
      };
      Event.add(reset, 'click', this.reset());
      Event.add(start, 'click', this.reset());
      // add keypress events
      Event.add(window, 'keydown', function(event) {
        var code = event.keyCode - 49;
        if (code >= 48) code -= 48; // adjust for 10-key pad
        if (code >= 0 && code <= 4) {
          var el = INPUTS[code];
          SELF.inputSingle(el);
        }

      });
    };

    this.reset = function() { // start/restart game
      return function() {
        document.getElementById('endScreen').className = '';
        document.getElementById('intro').className = '';
        SELF.setDefault();
        SELF.playPattern();
      };
    };

    this.setDefault = function() { // set default values
      LISTEN = false;
      PATTERN = [];
      SCORE = 0;
      RESPONSE = [];
			DISTRACTCOUNTER = [];
    };

    this.inputSingle = function(el) {
      if (LISTEN === true) {
        SELF.playSingle(el);
        SELF.distract();
        SELF.record(el);
      }
    };

    this.playSingle = function(el) { // play a color/note
      var note = el.id.replace('col', '') - 1;
      el.className = 'active';
      // MIDI.noteOn(0, NOTES[note], 127, 0);
      setTimeout(function() { // turn off color
        //MIDI.noteOff(0, note, 0);
        el.className = '';
      }, SPEED);
    };

    this.record = function(el) {
      if (PATTERN.length >= 1) {
        var note = el.id.replace('col', '') - 1;
        RESPONSE[RESPONSE.length] = parseInt(note);
        this.evaluate();
      }
    };

    this.evaluate = function() { // how did the user do?
      var response = RESPONSE.join(''),
        pattern = PATTERN.slice(0, RESPONSE.length).join('');
      if (response === pattern && RESPONSE.length === PATTERN.length) {
        LISTEN = false;
        RESPONSE = [];
        this.success();
      } else if (response !== pattern) {
        this.fail();
      }
    };

    this.success = function() { // reward
      CTRL.className = 'active';
      SCORE++;
      SCOREKEEPER.innerHTML = SCORE;
      setTimeout(function() {
        CTRL.className = '';
        SELF.playPattern();
      }, SPEED + (SPACING * 2));
    };

    this.fail = function() { // failure
      var failPattern = [0, 2, 1, 3, 4],
        i = 0;
      document.getElementById('endScreen').className = 'active';
      document.getElementById('finalScore').innerHTML = SCORE;
      document.getElementById('totalDistractions').innerHTML = DISTRACTCOUNTER.length;
      SELF.feedback();

      setTimeout(function() {
        (function play() { // recursive loop to play fail music
          setTimeout(function() {
              SELF.playSingle(INPUTS[failPattern[i]]);
              i++;
              if (i < failPattern.length) {
                play();
              }
            },
            SPEED * 0.7 >> 0);
        })(); // end recursion
      }, SPACING);

    };

    this.playPattern = function() { // playback a pattern
      var next = Math.random() * INPUTS.length >> 0,
        i = 0;
      PATTERN[PATTERN.length] = next;
      (function play() { // recursive loop to play pattern
        setTimeout(function() {
            SELF.playSingle(INPUTS[PATTERN[i]]);
            i++;
            if (i < PATTERN.length) {
              play();
            } else {
              setTimeout(function() {
                LISTEN = true;
              }, SPEED + SPACING);
            }
          },
          SPEED + SPACING);
      })(); // end recursion
    };

    this.saveStats = function() {
      var stats = [1, 2, 3];
      var statsJSON = JSON.parse(stats);

    };

    this.youtube = function() {
      var gifURLs = [
        "img/img1.gif",
        "img/img2.gif",
        "img/img3.gif",
        "img/img4.gif",
        "img/img5.gif"
      ];

      document.getElementById('gifFrame').src = gifURLs[Math.floor(Math.random() * gifURLs.length)];
      var dialog = document.getElementById('distractWindow');
      dialog.showModal();

      document.getElementById('exitDistract').onclick = function() {
        dialog.close();
      };
    };

    this.distract = function() {
      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      if (getRandomInt(1, 3) === 3) {
        SELF.youtube();
        DISTRACTCOUNTER[DISTRACTCOUNTER.length] = SCORE;
      }
    };

    this.feedback = function() {
      var DISTRACTCOUNTERBIN = new Array(SCORE);
      for (var i = 0; i <= SCORE; i++) {
        DISTRACTCOUNTERBIN[i] = 0;
      }
      for (var j = 0; j <= DISTRACTCOUNTER.length; j++) {
        DISTRACTCOUNTERBIN[DISTRACTCOUNTER[j] + 1]++;
      }

      var lineChartData = {
        labels: Array.apply(null, {
          length: SCORE + 1
        }).map(Number.call, Number),
        datasets: [{
          label: "Score vs Interruptions",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: Array.apply(null, {
              length: SCORE + 1
            }).map(Number.call, Number) // List of points from interruptcounter
        }, {
          label: "Interruptions",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,0,0,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: DISTRACTCOUNTERBIN
        }]
      };

      var ctx = document.getElementById("canvas").getContext("2d");
      window.myLine = new Chart(ctx).Line(lineChartData, {
        responsive: true,
        showTooltips: false
      });
    };

  };


  MIDI.loadPlugin(function() {
    var simonSays = new Simon();
    loader.stop();
    simonSays.init();
  }, "piano", "./inc/MIDI.js/"); // specifying a path doesn't work


})(Chart);
