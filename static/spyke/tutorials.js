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
            body: "<p>To get started, we need to create a neuron. Click the neuron panel</p>",
            condition: function() {return app.settingsTab == 'neuron';},
            flashing: ["#sidebar-tab-neuron"]
        },
        {
            header: "Create a neuron",
            body: "<p>Click the add neuron button to create a neuron</p>",
            condition: function() {return app.neurons.length == 1;},
            flashing: [".new-config-item"]
        },
        {
            header: "The stimuli panel",
            body: "<p>Now we need to create a current clamp.</p> <p>Open the stimuli tab.</p>",
            condition: function() {return app.settingsTab == 'stimuli';},
            flashing: ["#sidebar-tab-stimuli"]
        },
        {
            header: "Create a current clamp",
            body: "<p>Select 'Current Clamp' in the dropdown and click the add stimulus button to create the clamp.</p>",
            condition: function() {return app.stimuli.length == 1;},
            flashing: [".new-config-item"]
        },
        {
            header: "Open the stimulus settings",
            body: "<p>Click on the clamp's preview to open its settings.</p>",
            condition: function() {return $('#stimulus-header-container-0').hasClass('show');},
            flashing: ["#stimulus-header-container-0"]
        },
        {
            header: "Attach the clamp to Dendrite 1",
            body: "<p>The clamp is already set to attach to Neuron 1. Set the 'Section' dropdown to attach to 'Dendrite 1'</p>",
            condition: function() {return app.stimuli[0].section == "Dendrite 1";},
            flashing: ["#stim-sec-0"]
        },
        {
            header: "Running the simulation",
            body: "<p>Great! Now it's time to run the simulation. Click the play button at the top to run.</p>",
            condition: function() {return "views" in app.recording;},
            flashing: ["#run-control"]
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
            flashing: ['#amp-0']
        },
        {
            header: "Re-run the simulation",
            body: "<p>Re-run the simulation to see the results.</p>",
            condition: function() {return true;},
            flashing: [],
            btn:true
        },
        {
            header: "Fire away!",
            body: "<p>The voltage trace in the monitor shows the Neuron's voltage reaching the critical threshold for an action potential to take place. You can confirm that by going to the 'Spikes' tab of the Monitor.</p>",
            condition: function() {return app.monitorTab == "spikes";},
            flashing: ['#monitor-tab-spikes']
        },
        {
            header: "Finding the threshold",
            body: "<p>So we know that 0.1nA is too small, and 0.5nA is enough, but where is the threshold for causing an action potential for our Neuron?</p> <p>To find out, let's create another neuron so we can directly compare current inputs.</p> <p>Click on the neuron tab and click the plus button to add a second neuron.</p>",
            condition: function() {return app.neurons.length == 2;},
            flashing: []
        },
        {
            header: "Create a second stimulus",
            body: "<p>Great. Now navigate back to the stimulus tab and create a second current clamp.</p>",
            condition: function() {return app.stimuli.length == 2;},
            flashing: []
        },
        {
            header: "Set up the new stimulus",
            body: "<p>Open the settings for the new stimulus and set the 'Neuron' to 'Neuron 2' and the 'Section' to 'Dendrite 1'</p>",
            condition: function() {return app.stimuli[1].neuron == 2 && app.stimuli[1].section == "Dendrite 1";},
            flashing: ['#stim-sec-1', '#stim-neuron-1']
        },
        {
            header: "Run the simulation",
            body: "<p>Run the simulation again</p>",
            condition: function() {return true;},
            flashing: [],
            btn: true
        },
        {
            header: "Find the threshold",
            body: "<p>Great! You can see the voltage trace of both of the neurons in the monitor. Now we can directly compare the impacts of the two stimuli.</p> <p>To find the threshold, adjust the amplitude of the two stimuli and re-run the simulation until you find the value which causes the neuron to fire. To move on, set the stimuli amplitudes to values which are less than 0.001nA apart, where Neuron 1 fires and Neuron 2 doesn't.</p>",
            condition: function() {
                let a1 = app.stimuli[0].parameters[2].value;
                let a2 = app.stimuli[1].parameters[2].value;
                return a1 > 0.1036 && a2 < 0.1036 && (a1 - a2) <=0.0011;},
            flashing: [],
            btn: true
        },
        {
            header: "Changing the temperature",
            body: "<p>Awesome! So now we know that the threshold to fire for these conditions is around 0.1037nA.</p> <p>However, there are several other parameters which contribute to this value. Let's try changing the temperature. Change to the simulation tab in the configuration panel and change the temperature to 2 degrees. Then re-run the simulation to see what happens.",
            condition: function() {
                return app.simulation.celsius == 2;},
            flashing: ['#sidebar-tab-simulation'],
            btn: true
        },
        {
            header: "Changing the temperature",
            body: "<p>As you can see, the lower temperature causes Neuron 2 to fire as well.</p> <p>Adjust the amplitude of the stimuli again to find the new threshold. Make sure Neuron 1 fires, Neuron 2 doesn't, and the difference between the stimulus amplitude is <0.001nA.",
            condition: function() {
                let a1 = app.stimuli[0].parameters[2].value;
                let a2 = app.stimuli[1].parameters[2].value;
                return a1 > 0.10057 && a2 < 0.10057 && (a1 - a2) <=0.0011;},
            flashing: [],
            btn: true
        },
        {
            header: "Changing the temperature",
            body: "<p>Great job! Finally, let's change the temperature to 20 degrees and find the threshold for that value.</p>",
            condition: function() {
                let a1 = app.stimuli[0].parameters[2].value;
                let a2 = app.stimuli[1].parameters[2].value;
                console.log(app.simulation.celsius);
                let temp = app.simulation.celsius == 20;
                console.log('temp', temp);
                console.log(a1);
                console.log(a2);
                let cond = a1 >= 0.2058 && a2 < 0.2058 && (a1 - a2) <= 0.0011 && temp;
                console.log(cond);
                return  cond;},
            flashing: [],
            btn: true
        },
        {
            header: "Congratulations!",
            body: "<p>Congratulations! You've finished the first tutorial.</p>",
            condition: function() {
                return true;},
            flashing: [],
            btn: true
        }
        // 20deg: 0.21
        // 2deg: 0.1006

    ]
};

const tutorial2 = {
    title: "Tutorial 2 | Coincidence Detection",
    step: 0,
    steps: [{'header':"Step 1"}, {}]
};

const tutorials = [tutorial1, tutorial2];