
Multiple Neurons
- ~~Params for multiple neurons~~
- ~~Add Neuron~~
- ~~Backend (run 2 neurons)~~
- ~~Viz of 2 neurons~~
- ~~x, y coords~~
- ~~Attach stims to different neurons~~

Connecting
- ~~Connect 2 neurons~~
- ~~Edit connection~~
- ~~connection backend~~

- visualize connection
    - ~~draw connection~~
    - ~~replace during drag~~
    - ~~Fix conn centre~~
    - ~~draw on create~~

- ~~Collapsible preview stimuli & con~~

- ~~add Dendrite~~
- ~~remove Dendrite~~
- 
- ~~axon backend~~
- ~~multi-dendrite backend~~

- ~~choose syn location for connections~~

- ~~addNeuron offset~~

- Stims
    - ~~Choose segment & section~~
    - Choose stimulus type

- Neurons
    - pre-specified neurons
    - ~~Multiple dendrites~~
    - ~~edit axon~~
    - custom ion channels
    - channel density
    - nseg
    - all dendrites as one

- Simulation
    - temperature
    - update interval
    - Custom recordings
    - performance
    - incremental for long stretches
    - compress vectors?

- save simulation

- expand/minimize monitor/config

- Read & implement papers


Views
    - ~~1 color per neuron~~
    - Fix Dend V recordings
    - LFP summation
    - spike portraits
    - Phase portraits
    - Heatmaps
    - Viz popout





========
Later

- Robustness
    - Enforce unique GIDS
    - Better error handling on keys being passed to backend

- Layout
    - Harmonize Stimulus and Neuron CSS
    - SVG elements stay in order while dragging
    - sliders
    - move info to (i)
    - Change config item headers to gids
    - Nice connection in canvas
    - Fix Config headings
    - Improve neuron drag to not jump to point
    - Rotate neurons
    - Easier move handling
    - Google Material design components
    - Sidebars
        - Sticky sub headers
    - Sweet logo
        - favicon
    - stimuli neuron section formatting
    - dendrite collapse
    - dendrite numbering

- Refactoring
    - Move neuron template outside app
    - Generate config item sections from data
    - Ensure unique (HTML) IDs
    - move connections to models.py
    - Reuse bezier drawing code
    - Deal with multiple synapses in same loc

- Features
    - rename neurons
    - reaction diffusion
    - neuromorpho db
    - connectivity matrix

- Questions
    - Negative weighting (inteneurons)

- plotLabels
- axisLabels

- logging
- implement reset

- simulation run notifications
- save/download plots
- plot multiple values in one view

- localise dependencies

- tests

- viz
    - spike times
    - separate neurons on different y-axis points
    - heatmap for neuron
    - by-dendrite heatmaps

- recording

Notes

- Neuron design
    - Realistic? Abstracted? Interactive? Colour/changes



- Neurons
    - Soma
    - Dendrite
        - leak channels
    - Axon

    - Measurements
        - Membrane voltage
        - Current

    - Connectivity

- Simulation
    - Time
    - Membrane potential

- Stimulus
    - no
    - delay
    - Duration
    - amp
