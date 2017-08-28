new Vue({
    el: '#app',
    data: {
        running: false,
        startTimestamp: null,
        lastStepTimestamp: null,
        interval: 200,  // milliseconds
        //
        activeWorkoutId: null,
        activeWorkout: {},
        totalSeconds: 300,
        elapsed: null,  // ms elapsed in the workout
        elapsedSeconds: 0,  // TODO: could remove this, but it's convenient
        elapsedDisplay: null,  // A string-rep of elapsedSeconds, e.g. "00:35"
        remainingDisplay: null,
        // Current hang
        currentHang: null,
        currentTotalSeconds: 10,
        currentElapsed: null,
        currentDisplay: null,
        currentState: null,  // 'work' or 'rest'
        currentAction: 'Get ready...',
        leftHand: 'Jug',
        rightHand: 'Jug',
    },
    methods: {
        formatSeconds: function(seconds) {
            // `seconds` will be an integer that will never exceed 3600.
            d = new Date(null);
            d.setSeconds(seconds);
            return d.toISOString().substr(14,5);
        },
        redrawDisplayTime: function() {
            // Function to update the displayed timers, formatted nicely.
            this.elapsedDisplay = this.formatSeconds(this.elapsedSeconds);
            this.remainingDisplay = this.formatSeconds(this.totalSeconds - this.elapsedSeconds);
            this.currentDisplay = this.formatSeconds(this.currentTotalSeconds - Math.floor(this.currentElapsed / 1000));
        },
        beginWorkout: function() {
            // Function to reset the workout, set a timestamp and call the start function.
            // TODO: set up the activeWorkout object and set the display.
            if (!this.startTimestamp) {
                this.startTimestamp = new Date();
                this.elapsed = 0;
                this.currentElapsed = 0;
            }
        },
        startPause: function() {
            // Invert the running variable, and call step() if required.
            this.running = !this.running;
            if (this.running) {
                // Call the step function
                this.step();
            }
        },
        reset: function() {
            // TODO
        },
        step: function() {
            // Utility function to accumulate time while the workout is not paused.
            this.elapsed += this.interval;
            this.elapsedSeconds = Math.floor(this.elapsed / 1000);
            this.currentElapsed += this.interval;
            this.redrawDisplayTime();
            if (this.running) {
                setTimeout(this.step, this.interval);
            }
        },
        matchWorkout: function(el) {
            return el.id === this.activeWorkoutId;
        },
        selectWorkout: function(value) {
            // Invoked once when a workout is selected.
            // Reset the activeWorkout object
            this.activeWorkoutId = value;
            this.activeWorkout = this.workoutsAvailable.find(this.matchWorkout);
            // Calculate the total length of the workout.
            this.totalSeconds = 0;
            for (let i = 0; i < this.activeWorkout.hangs.length; i++) {
                this.totalSeconds += this.activeWorkout.hangs[i].hang_seconds;
                this.totalSeconds += this.activeWorkout.hangs[i].rest_seconds;
            }
            // Reset the display to the first hang.
            this.insertHang();
            this.redrawDisplayTime();
        },
        insertHang: function() {
            // Function to take the next hang off the activeWorkout and
            // insert it into the current hang vars.
            this.currentHang = this.activeWorkout.hangs.shift();
            this.currentTotalSeconds = this.currentHang.hang_seconds + this.currentHang.rest_seconds;
            this.currentElapsed = 0;
            this.currentState = 'work';  // New hang begins as work.
            this.currentAction = this.currentHang.type;
            this.leftHand = this.currentHang.left_hand;
            this.rightHand = this.currentHang.right_hand;
        },
    },
    mounted: function() {
        this.redrawDisplayTime();
        this.beginWorkout();
    },
    components: {
        workoutSelector: {
            data: function() {
                return {
                    selected: null
                };
            },
            props: ['workoutsAvailable', 'elapsed'],
            methods: {
                selectWorkout: function() {
                    this.$emit('select-workout', this.selected);
                },
            },
            template: `
                <select v-model="selected" v-on:change="selectWorkout" id="workout_select" :disabled=isDisabled>
                    <option v-for="workout in workoutsAvailable" v-bind:value="workout.id">{{ workout.name }}</option>
                </select>
            `,
            computed: {
                isDisabled: function() {
                    if (this.elapsed > 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        // WorkoutController
        // Workout
        // Hang
        // WorkoutEditor
        // HangEditor
        },
    },
    computed: {
        workoutsAvailable: function() {
            return [
                {
                    "name": "Jugs and Pockets",
                    "id": "jugs-and-pockets",
                    "owner": "app",
                    "hangs": [
                        {
                            "type": "Hang",
                            "left_hand": "Jug",
                            "right_hand": "Jug",
                            "hang_seconds": 10,
                            "rest_seconds": 5
                        },
                        {
                            "type": "Hang",
                            "left_hand": "Jug",
                            "right_hand": "Jug",
                            "hang_seconds": 10,
                            "rest_seconds": 5
                        }
                    ]
                },
                {
                    "name": "Simple Five",
                    "id": "simple-five",
                    "owner": "app",
                    "hangs": [
                        {
                            "type": "Hang",
                            "left_hand": "Jug",
                            "right_hand": "Pocket",
                            "hang_seconds": 5,
                            "rest_seconds": 5
                        },
                        {
                            "type": "Hang",
                            "left_hand": "Jug",
                            "right_hand": "Jug",
                            "hang_seconds": 10,
                            "rest_seconds": 10
                        }
                    ]
                },
                {
                    "name": "3-6-9 Pyramid",
                    "id": "3-6-9-pyramid",
                    "owner": "app",
                    "hangs": [
                        {
                            "type": "Hang",
                            "left_hand": "Sloper",
                            "right_hand": "Sloper",
                            "hang_seconds": 3,
                            "rest_seconds": 3
                        },
                        {
                            "type": "Hang",
                            "left_hand": "Sloper",
                            "right_hand": "Sloper",
                            "hang_seconds": 6,
                            "rest_seconds": 6
                        },
                        {
                            "type": "Hang",
                            "left_hand": "Sloper",
                            "right_hand": "Sloper",
                            "hang_seconds": 9,
                            "rest_seconds": 9
                        }
                    ]
                }
            ]
        }
    },
});
