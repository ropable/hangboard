new Vue({
    el: '#app',
    data: {
        //selected: null,
        activeWorkout: {},
        running: false,
        startTimestamp: null,
        lastStepTimestamp: null,
        interval: 200,  // milliseconds
        //
        totalSeconds: 300,
        elapsed: null,  // ms elapsed in the workout
        elapsedSeconds: 0,  // TODO: could remove this, but it's convenient
        elapsedDisplay: null,  // A string-rep of elapsedSeconds, e.g. "00:35"
        remainingDisplay: null,
        // Current move/hang
        currentTotalSeconds: 10,
        currentElapsed: null,
        currentDisplay: null,
        //
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
        selectWorkout: function(value) {
            console.log(value);
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
                }
            },
            props: ['workoutsAvailable'],
            methods: {
                selectWorkout: function() {
                    this.$emit('select-workout', this.selected);
                },
            },
            template: `
                <select v-model="selected" v-on:change="selectWorkout" id="workout_select">
                    <option disabled value="">Please select one</option>
                    <option v-for="workout in workoutsAvailable" v-bind:value="workout.id">{{ workout.name }}</option>
                </select>
            `,
        //WorkoutSelector,
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
                }
            ]
        }
    },
});
