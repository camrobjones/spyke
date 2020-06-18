/**
Spyke Tutorial Data
-------------------
*/

const tutorial1 = {
    title: "Tutorial 1 | Threshold: To fire or not to fire",
    step: 0,
    steps: [
        {
            header: "Welcome!",
            body: "<p>Welcome to the first Spyke tutorial. This tutorial will guide you through creating a neuron, stimulating it with a current clamp, and testing the conditions under which it will fire.</p> <p>Click 'Next' to continue</p>",
            condition: function() {return true;},
            flashing: [],
            btn: true
        },
        {
            header: "The neuron panel",
            body: "<p>To get started, we need to create a neuron. Click the flashing 'Neuron' tab in the configuration sidebar to open the neuron panel.</p>",
            condition: function() {return app.settingsTab == 'neuron';},
            flashing: ["#sidebar-tab-neuron"],
            auto: true
        },
        {
            header: "Create a neuron",
            body: "<p>Click the add neuron button to create a neuron.</p>",
            condition: function() {return app.neurons.length == 1;},
            flashing: [".new-config-item"],
            auto: true
        },
        {
            header: "The stimuli panel",
            body: "<p>Now we need to create a current clamp.</p> <p>Open the stimuli panel in the configuration sidebar.</p>",
            condition: function() {return app.settingsTab == 'stimuli';},
            flashing: ["#sidebar-tab-stimuli"],
            auto: true
        },
        {
            header: "Create a current clamp",
            body: "<p>Select 'Current Clamp' in the dropdown and click the add stimulus button to create the clamp.</p>",
            condition: function() {return app.stimuli.length == 1;},
            flashing: [".new-config-item"],
            auto: true
        },
        {
            header: "Open the stimulus settings",
            body: "<p>Click on the clamp's preview to open its settings.</p>",
            condition: function() {return $('#stimulus-header-container-0').hasClass('show');},
            flashing: ["#stimulus-header-container-0"],
            auto: true
        },
        {
            header: "Attach the clamp to Dendrite 1",
            body: "<p>The clamp is already set to attach to Neuron 1. Set the 'Section' dropdown to attach to 'Dendrite 1'.</p>",
            condition: function() {return app.stimuli[0].section == "Dendrite 1";},
            flashing: ["#stim-sec-0"],
            auto: true
        },
        {
            header: "Running the simulation",
            body: "<p>Great! Now it's time to run the simulation. Click the play button at the top to run.</p>",
            setup: function() {app.state.sim = false;},
            condition: function() {return app.state.sim;},
            flashing: ["#run-control"],
            auto: true
        },
        {
            header: "Inspect the results",
            body: "<p>Awesome! You can see the results from the simulation in the 'Monitor' panel at the bottom.</p> <p>It looks like the stimulus clamp caused the voltage of the neuron to increase, but not enough to cause an action potential.</p>",
            condition: function() {return true;},
            flashing: [],
            btn: true
        },
        {
            header: "Increasing the current",
            body: "<p>Let's try increasing the current to see if we can cause an action potential. Change the Amplitude of the current clamp from 0.1nA to 0.5nA.</p>",
            condition: function() {return app.stimuli[0].parameters[2].value == 0.5;},
            flashing: ['#amp-0'],
            auto: true
        },
        {
            header: "Re-run the simulation",
            body: "<p>Re-run the simulation to see the results.</p>",
            setup: function() {app.state.sim = false;},
            condition: function() {return app.state.sim;},
            flashing: [],
            auto:true
        },
        {
            header: "Fire away!",
            body: "<p>The voltage trace in the monitor shows the Neuron's voltage reaching the critical threshold for an action potential to take place.</p> <p>You can confirm that by going to the 'Spikes' tab of the Monitor at the bottom.</p>",
            condition: function() {return app.monitorTab == "spikes";},
            flashing: ['#monitor-tab-spikes'],
            auto: true
        },
        {
            header: "Finding the threshold",
            body: "<p>So we know that 0.1nA is too little current, and 0.5nA is more than enough, but where is the threshold for causing an action potential for our Neuron?</p> <p>To find out, let's create another neuron so we can directly compare current inputs.</p> <p>Click on the neuron tab and click the plus button to add a second neuron.</p>",
            substep: 0,
            substeps: [
                {
                    id: 1,
                    body: "Open the Neuron panel",
                    condition: function() {return app.settingsTab == "neuron";}
                },
                {
                    id: 2,
                    body: "Create a second neuron",
                    condition: function() {return app.neurons.length == 2;}
                },
            ],
            condition: function() {return app.neurons.length == 2;},
            flashing: [],
            auto: true
        },
        {
            header: "Create a second stimulus",
            body: "<p>Great. Now navigate back to the stimulus tab and create a second current clamp.</p>",
            substep: 0,
            substeps: [
                {
                    id: 1,
                    body: "Open the Stimuli panel",
                    condition: function() {return app.settingsTab == "stimuli";}
                },
                {
                    id: 2,
                    body: "Create a second current clamp",
                    condition: function() {return app.stimuli.length == 2;}
                },
                {
                    id: 3,
                    body: "Open settings for the new current clamp",
                    condition: function() {return $('#stimulus-header-container-1').hasClass('show');}
                },
                {
                    id: 4,
                    body: "Attach the clamp to 'Neuron 2'",
                    condition: function() {return app.stimuli.length == 2 && app.stimuli[1].neuron == 2;},
                    flashing: ['#stim-neuron-1'],
                },
                {
                    id: 5,
                    body: "Set the section to 'Dendrite 1'",
                    condition: function() {return app.stimuli.length == 2 && app.stimuli[1].section == "Dendrite 1";},
                    flashing: ['#stim-sec-1'],
                },

            ],
            condition: function() {return app.tutorialStep.substeps.every(x=>x.condition());},
            flashing: [],
            auto: true
        },
        {
            header: "Run the simulation",
            body: "<p>Run the simulation again.</p>",
            setup: function() {app.state.sim = false;},
            condition: function() {return app.state.sim;},
            flashing: [],
        },
        {
            header: "Find the threshold",
            body: "<p>Great! You can see the voltage trace of both of the neurons in the monitor. Now we can directly compare the impacts of the two stimuli.</p> <p>To find the threshold, adjust the amplitude of the two stimuli and re-run the simulation until you find the value which causes the neuron to fire. To move on, set the stimuli amplitudes to values which are less than 0.001nA apart, where Neuron 1 fires and Neuron 2 doesn't.</p>",
            condition: function() {
                let a1 = app.stimuli[0].parameters[2].value;
                let a2 = app.stimuli[1].parameters[2].value;
                return a1 >= 0.10362 && a2 < 0.10362 && (a1 - a2) <= 0.0011;},
            flashing: [],
            btn: true
        },
        {
            header: "Changing the temperature",
            body: "<p>Awesome! So now we know that the threshold to fire for these conditions is around 0.1037nA.</p> <p>However, there are several other parameters which contribute to this value. Let's try changing the temperature. Change to the simulation tab in the configuration panel and change the temperature to 2 degrees. Then re-run the simulation to see what happens.",
            substep: 0,
            substeps: [
                {   
                    id: 1,
                    body: "Switch to the simulation panel",
                    flashing: ['#sidebar-tab-simulation'],
                    condition: function() {
                        return app.settingsTab == "simulation";
                    }
                },
                {
                    id: 2,
                    body: "Change the temperature to 2 degrees Celsius",
                    flashing: ['#celsius'],
                    condition: function() {
                        return app.simulation.celsius == 2;
                    }
                },
                {
                    id: 3,
                    body: "Re-run the simulation",
                    setup: function() {
                        console.log("running setup!");
                        app.state.sim = false;
                        this.ready = true;
                    },
                    ready:false,
                    condition: function() {
                        return app.state.sim && this.ready;
                    }
                }
            ],
            condition: function() {
                return app.tutorialStep.substeps.every(x=>x.condition());
            },
            flashing: [],
            auto: true
        },
        {
            header: "Find the new threshold",
            body: "<p>As you can see, the lower temperature causes Neuron 2 to fire as well.</p> <p>Adjust the amplitude of the stimuli again to find the new threshold. Make sure Neuron 1 fires, Neuron 2 doesn't, and the difference between the stimulus amplitude is <0.001nA.",
            condition: function() {
                let a1 = app.stimuli[0].parameters[2].value;
                let a2 = app.stimuli[1].parameters[2].value;
                return a1 > 0.10057 && a2 < 0.10057 && (a1 - a2) <= 0.0011;},
            flashing: [],
            btn: true
        },
        {
            header: "Threshold for 20 degrees",
            body: "<p>Great job! Finally, let's change the temperature to 20 degrees and find the threshold for that value.</p>",
            substep: 0,
            substeps: [  
                {
                    id: 1,
                    body: "Change the temperature to 20 degrees Celsius",
                    flashing: [],
                    condition: function() {
                        return app.simulation.celsius == 20;
                    }
                },
                {
                    id: 2,
                    body: "Set Neuron 1 just above the threshold and Neuron 2 just below it (<0.001nA apart).",
                    flashing: [],
                    condition: function() {
                        let a1 = app.stimuli[0].parameters[2].value;
                        let a2 = app.stimuli[1].parameters[2].value;
                        return a1 >= 0.2058 && a2 < 0.2058 && (a1 - a2) <= 0.0011;
                    }
                },
                {
                    id: 3,
                    body: "Re-run the simulation",
                    setup: function() {
                        console.log("running setup!");
                        app.state.sim = false;
                        this.ready = true;
                    },
                    ready:false,
                    condition: function() {
                        return app.state.sim && this.ready;
                    }
                }
            ],
            condition: function() {
                return app.tutorialStep.substeps.every(x=>x.condition());
            },
            flashing: [],
            auto: true
        },
        {
            header: "Effects Stimulus Duration",
            body: "<p>Fantastic! This temperature experiment should have reinforced your observation that there is no fixed voltage threshold for an action potential.</p> <p> Next we will look at the effect of stimulus duration. Before we move on, restore the temperature to 6.3 degrees C.",
            condition: function() {return app.simulation.celsius == 6.3;},
            flashing: [],
            btn: true
        },
        {
            header: "Effects Stimulus Duration",
            body: "<p>Stimuli durations for neurons can range from several seconds to sub-milisecond. Set the stimulus duration of both current clamps to 0.1ms.</p>",
            condition: function() {return app.stimuli[0].parameters[0].value == 0.1 && app.stimuli[1].parameters[0].value == 0.1;},
            flashing: [],
            auto: true
        },
        {
            header: "A short sharp shock",
            body: "<p>Neither of our neurons are anywhere near threshold any more!</p> <p>Find the amplitude required to generate an action potential at this duration and ensure Neuron 1 and 2 are just above and below the threshold as before (<0.1nA apart).",
            condition: function() {
                let a1 = app.stimuli[0].parameters[2].value;
                let a2 = app.stimuli[1].parameters[2].value;
                return a1 >= 2.82 && a2 < 2.82 && (a1 - a2) <= 0.11;
            },
            flashing: [],
            btn: true
        },
        {
            header: "The duration-amplitude relationship",
            body: "<p>Nice work! Now double the duration of both stimuli to 0.2 and find the new threshold</p> <p>What sort of decrease in amplitude might you expect for a doubling in duration?</p>",
            substep: 0,
            substeps: [  
                {
                    id: 1,
                    body: "Change the duration of both stimuli to 0.2",
                    flashing: [],
                    condition: function() {
                        return app.stimuli[0].parameters[0].value == 0.2 && app.stimuli[1].parameters[0].value == 0.2;
                    }
                },
                {
                    id: 2,
                    body: "Set Neuron 1 just above the threshold and Neuron 2 just below it (<0.1nA apart).",
                    flashing: [],
                    condition: function() {
                        let a1 = app.stimuli[0].parameters[2].value;
                        let a2 = app.stimuli[1].parameters[2].value;
                        return a1 >= 1.42 && a2 < 1.42 && (a1 - a2) <= 0.11;
                    }
                },
                {
                    id: 3,
                    body: "Re-run the simulation",
                    setup: function() {
                        console.log("running setup!");
                        app.state.sim = false;
                        this.ready = true;
                    },
                    ready:false,
                    condition: function() {
                        return app.state.sim && this.ready;
                    }
                }
            ],
            condition: function() {
                return app.tutorialStep.substeps.every(x=>x.condition());
            },
            flashing: [],
            auto: true
        },
        {
            header: "The duration-amplitude relationship",
            body: "<p>At this timescale, the relationship appears linear.</p> <p>Now find the threshold for 1, 2, and 20ms respectively. For each duration ensure both stimuli are set to the correct value, Neuron 1 and 2 are above and below the threshold respectively, and the stimulus amplitudes are <0.1nA apart.",
            substep: 0,
            substeps: [  
                {
                    id: 1,
                    body: "Find the threshold for 1ms duration",
                    flashing: [],
                    completed: false,
                    condition: function() {
                        let dur = app.stimuli[0].parameters[0].value == 1 && app.stimuli[1].parameters[0].value == 1;
                        let a1 = app.stimuli[0].parameters[2].value;
                        let a2 = app.stimuli[1].parameters[2].value;
                        if (a1 >= 0.298 && a2 < 0.298 && (a1 - a2) <= 0.011 && dur) {
                            this.completed = true;
                        }
                        return this.completed;
                    }
                },
                {
                    id: 2,
                    body: "Find the threshold for 2ms duration",
                    flashing: [],
                    completed:false,
                    condition: function() {
                        let dur = app.stimuli[0].parameters[0].value == 2 && app.stimuli[1].parameters[0].value == 2;
                        let a1 = app.stimuli[0].parameters[2].value;
                        let a2 = app.stimuli[1].parameters[2].value;
                        if (a1 >= 0.167 && a2 < 0.167 && (a1 - a2) <= 0.011 && dur) {
                            this.completed = true;
                        }
                        return this.completed;
                    }
                },
                {
                    id: 3,
                    body: "Find the threshold for 20ms duration",
                    flashing: [],
                    completed:false,
                    condition: function() {
                        let dur = app.stimuli[0].parameters[0].value == 20 && app.stimuli[1].parameters[0].value == 20;
                        let a1 = app.stimuli[0].parameters[2].value;
                        let a2 = app.stimuli[1].parameters[2].value;
                        if (a1 >= 0.099 && a2 < 0.099 && (a1 - a2) <= 0.011 && dur) {
                            this.completed = true;
                        }
                        return this.completed;
                    }
                }
            ],
            condition: function() {
                return app.tutorialStep.substeps.every(x=>x.condition());
            },
            flashing: [],
            auto: true
        },

        // Alternating current 
        // 100ms
        // slowly increase the amplitude of the stimulus current
        // ind the lowest amplitude of the stimulus that evokes continuous firing throughout the pulse
        // ncrease the stimulus duration to 500 ms
        // gain slowly increase the amplitude of the stimulus current. Does the rate of firing encode the amplitude of the stimulus?
        // Give a series of pulses of increasing amplitude.

        {
            header: "Congratulations!",
            body: "<p>Congratulations! You've finished the first tutorial.</p>",
            condition: function() {
                return true;},
            flashing: [],
            btn: true
        }
    ]
};

const tutorial2 = {
    title: "Tutorial 2 | Coincidence Detection",
    step: 0,
    steps: [
        {
            header: "Step 1",
            body: "<p>Test WIP</p>",
            condition: function(){return true;},
            btn: true
        },
        {
            header: "Changing the temperature",
            body: "<p>Awesome! So now we know that the threshold to fire for these conditions is around 0.1037nA.</p> <p>However, there are several other parameters which contribute to this value. Let's try changing the temperature. Change to the simulation tab in the configuration panel and change the temperature to 2 degrees. Then re-run the simulation to see what happens.",
            substep: 0,
            substeps: [
                {   
                    id: 1,
                    body: "Switch to the simulation panel",
                    flashing: ['#sidebar-tab-simulation'],
                    condition: function() {
                        return app.settingsTab == "simulation";
                    }
                },
                {
                    id: 2,
                    body: "Change the temperature to 2 degrees Celsius",
                    flashing: ['#celsius'],
                    condition: function() {
                        return app.simulation.celsius == 2;
                    }
                },
                {
                    id: 3,
                    body: "Re-run the simulation",
                    setup: function() {
                        console.log("running setup!");
                        app.state.sim = false;
                        this.ready = true;
                    },
                    ready:false,
                    condition: function() {
                        return app.state.sim && this.ready;
                    }
                },

            ],
            condition: function() {
                return app.tutorialStep.substeps.every(x=>x.condition());
            },
            flashing: ['#sidebar-tab-simulation'],
            btn: true
        },
        {
            header: "Step 3",
            body: "<p>Congrats! You made it!</p>",
            condition: function(){return true;},
            btn: true
        },

        ]
};

const tutorials = [tutorial1, tutorial2];