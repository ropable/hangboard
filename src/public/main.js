/* global Vue */

new Vue({
  el: '#app',
  data: {
    interval: 1000, // milliseconds
    // Workout
    workoutId: null,
    workout: null,
    workoutSeconds: null,
    workoutState: null, // 'hang','rest','count-in','complete'
    running: false, // Defines if the workout is active or paused.
    elapsed: 0, // Time elapsed in the workout (ms).
    elapsedDisplay: null, // A string-rep of elapsedSeconds, e.g. "00:35"
    remainingDisplay: null, // String rep for the remaining seconds in the workout.
    // Count in
    countInTime: null, // Length of the count-in period (ms).
    countInTimeDisplay: null,
    // Hang
    currentHang: null,
    currentHangIndex: 0,
    currentAction: null,
    leftHand: null,
    rightHand: null,
    currentTime: null,
    currentTimeDisplay: null,
    // Rest
    restTime: null,
    restTimeDisplay: null
  },
  methods: {
    formatSeconds: function (seconds) {
      // `seconds` will be an integer that will never exceed 3600.
      let d = new Date(null)
      d.setSeconds(seconds)
      return d.toISOString().substr(14, 5)
    },
    redrawDisplay: function () {
      this.elapsedDisplay = this.formatSeconds(Math.floor(this.elapsed / 1000))
      this.remainingDisplay = this.formatSeconds(this.workoutSeconds - Math.floor(this.elapsed / 1000))
      this.currentTimeDisplay = this.formatSeconds(Math.floor(this.currentTime / 1000))
      this.restTimeDisplay = this.formatSeconds(Math.floor(this.restTime / 1000))
      this.countInTimeDisplay = this.formatSeconds(Math.floor(this.countInTime / 1000))
    },
    start: function () {
      // Disable the workout selector.
      document.getElementById('workout_select').disabled = true
      if (!this.workoutState) { // Assume null
        this.workoutState = 'count-in'
      }
      this.running = true
      this.step()
    },
    pause: function () {
      this.running = false
    },
    reset: function () {
      // Function to reset the display after a workout is selected, or if the reset button is pressed.
      document.getElementById('workout_select').disabled = false
      this.workout = this.workoutsAvailable.find(this.matchWorkout)
      // Calculate the total length of the workout.
      this.workoutSeconds = 0
      for (let i = 0, len = this.workout.hangs.length; i < len; i++) {
        this.workoutSeconds += this.workout.hangs[i].hang_seconds
        this.workoutSeconds += this.workout.hangs[i].rest_seconds
      }
      this.workoutState = null
      this.elapsed = 0
      this.countInTime = 5000
      this.currentHang = null
      this.currentHangIndex = 0
      this.insertHang()
      this.redrawDisplay()
    },
    step: function () {
      if (this.workoutState === 'count-in') {
        if (this.countInTime <= 0) { // Count-in finished.
          this.workoutState = 'hang'
        } else {
          this.countInTime -= this.interval
        }
      } else if (this.workoutState === 'hang') {
        if (this.currentTime <= 0) { // Hang finished.
          this.workoutState = 'rest'
        } else {
          this.currentTime -= this.interval
          this.elapsed += this.interval
        }
      } else { // Rest
        if (this.restTime <= 0) { // Rest finished.
          this.currentHangIndex += 1
          if (this.workout.hangs.length > this.currentHangIndex) {
            this.workoutState = 'hang'
            this.insertHang()
          } else { // No more hangs.
            this.running = false
            this.workoutState = 'complete'
            document.getElementById('workout_select').disabled = false
          }
        } else {
          this.restTime -= this.interval
          this.elapsed += this.interval
        }
      }
      // Increment time and refresh the display.
      this.redrawDisplay()
      if (this.running) {
        setTimeout(this.step, this.interval)
      }
    },
    matchWorkout: function (el) {
      return el.id === this.workoutId
    },
    selectWorkout: function (value) {
      // Invoked once when a workout is selected.
      // Reset the workout object
      this.workoutId = value
      this.reset()
    },
    insertHang: function () {
      // Function to take the next hang off the workout and
      // insert it into the current hang vars.
      this.currentHang = this.workout.hangs[this.currentHangIndex]
      this.currentTime = this.currentHang.hang_seconds * 1000
      this.currentAction = this.currentHang.type
      this.leftHand = this.currentHang.left_hand
      this.rightHand = this.currentHang.right_hand
      this.restTime = this.currentHang.rest_seconds * 1000
    }
  },
  components: {
    workoutSelector: {
      data: function () {
        return {
          selected: null
        }
      },
      props: ['workoutsAvailable', 'elapsed'],
      methods: {
        selectWorkout: function () {
          this.$emit('select-workout', this.selected)
        }
      },
      template: `
        <select v-model="selected" v-on:change="selectWorkout" id="workout_select">
          <option value disabled selected>Select a workout</option>
          <option v-for="workout in workoutsAvailable" v-bind:value="workout.id">{{ workout.name }}</option>
        </select>
      `
    },
    startPauseControl: {
      props: ['running', 'workoutState'],
      methods: {
        startPause: function () {
          if (this.running) {
            this.$emit('control', 'pause')
          } else {
            this.$emit('control', 'start')
          }
        }
      },
      template: '<button class="button-xlarge pure-button" v-on:click="startPause" id="button-start-pause">Start/pause</button>'
      //  <button class="button-xlarge pure-button" v-on:click="start()" v-if="!running && workoutState != 'complete'">Start</button>
    }
    // WorkoutControl
    // Workout
    // Hang
    // WorkoutEditor
    // HangEditor
  },
  computed: {
    workoutsAvailable: function () {
      return [
        {
          'name': 'Jugs and Pockets',
          'id': 'jugs-and-pockets',
          'owner': 'app',
          'hangs': [
            {
              'type': 'Hang',
              'left_hand': 'Pocket',
              'right_hand': 'Jug',
              'hang_seconds': 10,
              'rest_seconds': 5
            },
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': 'Pocket',
              'hang_seconds': 10,
              'rest_seconds': 5
            }
          ]
        },
        {
          'name': 'Simple Five',
          'id': 'simple-five',
          'owner': 'app',
          'hangs': [
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 5,
              'rest_seconds': 5
            },
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 5,
              'rest_seconds': 5
            },
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 10,
              'rest_seconds': 5
            },
            {
              'type': '2 Pull-ups',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 5,
              'rest_seconds': 5
            },
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 10,
              'rest_seconds': 10
            },
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 10,
              'rest_seconds': 10
            },
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': '3-finger pocket',
              'hang_seconds': 5,
              'rest_seconds': 5
            },
            {
              'type': 'Hang',
              'left_hand': '3-finger pocket',
              'right_hand': 'Jug',
              'hang_seconds': 5,
              'rest_seconds': 10
            },
            {
              'type': 'Hang',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 10,
              'rest_seconds': 10
            },
            {
              'type': '2 Pull-ups',
              'left_hand': 'Jug',
              'right_hand': 'Jug',
              'hang_seconds': 5,
              'rest_seconds': 10
            }
          ]
        },
        {
          'name': '3-6-9 Pyramid',
          'id': '3-6-9-pyramid',
          'owner': 'app',
          'hangs': [
            {
              'type': 'Hang',
              'left_hand': 'Sloper',
              'right_hand': 'Sloper',
              'hang_seconds': 3,
              'rest_seconds': 3
            },
            {
              'type': 'Hang',
              'left_hand': 'Sloper',
              'right_hand': 'Sloper',
              'hang_seconds': 6,
              'rest_seconds': 6
            },
            {
              'type': 'Hang',
              'left_hand': 'Sloper',
              'right_hand': 'Sloper',
              'hang_seconds': 9,
              'rest_seconds': 9
            }
          ]
        }
      ]
    }
  }
})
