new Vue({
    el: '#app',
    data: {
        interval: 200,  // milliseconds
        // Workout
        workoutId: null,
        workout: null,
        workoutSeconds: null,
        workoutState: null,  // 'hang','rest' or 'count-in'
        running: false,  // Defines if the workout is active or paused.
        elapsed: 0,  // Time elapsed in the workout (ms).
        elapsedDisplay: null,  // A string-rep of elapsedSeconds, e.g. "00:35"
        remainingDisplay: null,  // String rep for the remaining seconds in the workout.
        // Count in
        countInTime: null,  // Length of the count-in period (ms).
        countInTimeDisplay: null,
        // Hang
        currentHang: null,
        currentAction: null,
        leftHand: null,
        rightHand: null,
        currentTime: null,
        currentTimeDisplay: null,
        // Rest
        restTime: null,
        restTimeDisplay: null,
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
            if (this.workoutState == 'count-in') {
                this.currentTimeDisplay = this.formatSeconds(Math.floor(this.countInTime / 1000));
            } else {
                this.elapsedDisplay = this.formatSeconds(Math.floor(this.elapsed / 1000));
                this.remainingDisplay = this.formatSeconds(this.workoutSeconds - Math.floor(this.elapsed / 1000));
                this.currentTimeDisplay = this.formatSeconds(Math.floor(this.currentTime / 1000));
                this.restTimeDisplay = this.formatSeconds(Math.floor(this.restTime / 1000));
            }
        },
        startPause: function() {
            let el = document.getElementById('workout_select');
            if (el) {
                el.selectedIndex = -1;
            }
            // Invert the running variable, and call step() or stepCountin() as required.
            this.running = !this.running;
            if (this.running) {
                // If we haven't finished the count in, do that first.
                if (this.countInTime > 0) {
                    this.workoutState = 'count-in';
                    this.currentAction = 'Get ready...';
                }
                // Call the step function
                this.step();
            }
        },
        reset: function() {
            this.elapsed = 0;
            this.countInTime = 5000;
            // Reset the display to the first hang.
            this.workout = this.workoutsAvailable.find(this.matchWorkout);
            // Calculate the total length of the workout.
            this.workoutSeconds = 0;
            for (let i = 0; i < this.workout.hangs.length; i++) {
                this.workoutSeconds += this.workout.hangs[i].hang_seconds;
                this.workoutSeconds += this.workout.hangs[i].rest_seconds;
            }
            this.insertHang();
            this.redrawDisplayTime();
        },
        step: function() {
            // Utility function to accumulate time while the workout is not paused.
            if (this.workoutState == 'count-in') {  // Count-in period
                if (this.countInTime > 0) {
                    this.countInTime -= this.interval;
                }
            }
            // End the count-in period if required.
            if (this.workoutState == 'count-in' && this.countInTime <= 0 && this.elapsed == 0) {
                console.log('COUNT IN ENDED');
                this.workoutState = 'hang';
                this.currentAction = this.currentHang.type;
            }
            // If the rest has completed, insert the next hang.
            if (this.workoutState == 'rest' && this.restTime <= 0) {
                if (this.workout.hangs.length > 0) {
                    console.log('REST FINISHED - HANG');
                    this.workoutState = 'hang';
                    this.insertHang();
                } else {  // No more hangs.
                    console.log('COMPLETED');
                    this.running = false;
                    // TODO: proper completion.
                }
            }
            // If we're still resting, decrement the rest timer.
            if (this.workoutState == 'rest' && this.restTime > 0) {
                console.log('RESTING');
                this.restTime -= this.interval;
            }
            // If the hang has completed, insert the next one and change to resting state.
            if (this.workoutState == 'hang' && ((this.currentElapsed / 1000) >= this.currentTotalSeconds)) {
                console.log('HANG FINISHED - REST');
                this.workoutState = 'rest';
                this.insertHang();
            }
            if (this.workoutState == 'hang' && this) {
                this.elapsed += this.interval;
            }
            // Increment time and refresh the display.
            this.elapsed += this.interval;
            this.redrawDisplayTime();
            // Not paused or inactive - schedule the step function to repeat.
            if (this.running) {
                setTimeout(this.step, this.interval);
            }
        },
        matchWorkout: function(el) {
            return el.id === this.workoutId;
        },
        selectWorkout: function(value) {
            // Invoked once when a workout is selected.
            // Reset the workout object
            this.workoutId = value;
            this.reset();
        },
        insertHang: function() {
            // Function to take the next hang off the workout and
            // insert it into the current hang vars.
            this.currentHang = this.workout.hangs.shift();
            this.currentTime = this.currentHang.hang_seconds * 1000;
            this.currentAction = this.currentHang.type;
            this.leftHand = this.currentHang.left_hand;
            this.rightHand = this.currentHang.right_hand;
            this.restTime = this.currentHang.rest_seconds * 1000;
        },
        resting: function() {
            if (this.workoutState == 'rest') {
                return true;
            }
            return false;
        },
        selectDisabled: function() {
            if (this.workoutState) {
                return true;
            }
            return false;
        }
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
                <select v-if="elapsed == 0" v-model="selected" v-on:change="selectWorkout" id="workout_select">
                    <option v-for="workout in workoutsAvailable" v-bind:value="workout.id">{{ workout.name }}</option>
                </select>
            `,
        },
        // WorkoutControl
        // Workout
        // Hang
        // WorkoutEditor
        // HangEditor
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
                            "left_hand": "Pocket",
                            "right_hand": "Jug",
                            "hang_seconds": 10,
                            "rest_seconds": 5
                        },
                        {
                            "type": "Hang",
                            "left_hand": "Jug",
                            "right_hand": "Pocket",
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
