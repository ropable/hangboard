new Vue({
    el: '#app',
    data: {
        activeWorkout: {},
        totalSeconds: 300,
        elapsedSeconds: 0,
        remainingSeconds: 300,
        currentMoveTotalSeconds: 10,
        currentMoveSeconds: 10,
        currentMoveElapsedSeconds: 0,
        elapsedDisplay: null,
        remainingDisplay: null,
        currentMoveDisplay: null,
        currentAction: 'Get ready...',
        leftHand: 'Jug',
        rightHand: 'Jug',
        running: false,
        startTimestamp: null,
        lastStepTimestamp: null,
        elapsed: null,
        elapsedCurrent: null,
        interval: 250,  // milliseconds
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
            this.remainingDisplay = this.formatSeconds(this.remainingSeconds);
            this.currentMoveDisplay = this.formatSeconds(this.currentMoveSeconds);
        },
        beginWorkout: function() {
            // Function to reset the workout, set a timestamp and call the start function.
            // TODO: set up the activeWorkout object and set the display.
            if (!this.startTimestamp) {
                this.startTimestamp = new Date();
                this.elapsed = 0;
                this.elapsedCurrent = 0;
            }
            //this.startPause();
        },
        startPause: function() {
            // Invert the running variable, and call step() if required.
            this.running = !this.running;
            if (this.running) {
                // Call the step function
                this.step();
            }
        },
        reset: function() {},
        step: function() {
            // Utility function to accumulate time while the workout is not paused.
            this.elapsed += this.interval;
            this.elapsedCurrent += this.interval;
            this.elapsedSeconds = Math.floor(this.elapsed / 1000);
            this.remainingSeconds = this.totalSeconds - this.elapsedSeconds;
            this.currentMoveSeconds = this.currentMoveTotalSeconds - Math.floor(this.elapsedCurrent / 1000);
            this.redrawDisplayTime();
            if (this.running) {
                setTimeout(this.step, this.interval);
            }
        }
    },
    mounted: function() {
        this.redrawDisplayTime();
        this.beginWorkout();
    },
    components: {
        workoutSelector: {
            template: `
                <select id="workout_select">
                    <option v-for="workout in workoutsAvailable" :value="workout.id">{{ workout.name }}</option>
                </select>
            `,
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
                            "name": "Simple Five",
                            "id": "simple-five",
                            "owner": "app",
                            "hangs": [
                                {
                                    "type": "Hang",
                                    "left_hand": "Jug",
                                    "right_hand": "Jug",
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
        //WorkoutSelector,
        // Workout
        // Hang
        // WorkoutEditor
        // HangEditor
        },
    }
});
