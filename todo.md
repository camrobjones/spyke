
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

- ~~save simulation~~
    - 03.26: v-for neurons
    - 04.19: run notifications
    - 05.46: saveload buttons
    -----
    - 07.47: saveload popups
    - 08.43: load popup
        - 08.52: get saved files
    - 09.24: save button work
    - 09.31: saveload notifications
    - 10.12: Error handling
    - 12.12

- ~~Simulation running notifications~~

- ~~Compute gids~~
    - Minimize no. of data

- ~~Simulation logging~~
    - ~~Error handling~~

- ~~Ion channels~~
    - List available channels
    - Add channel panel
    - List available parameters
        - (could manual & generate json on create)

- ~~Cleanup backend~~
    - ~~Section classes~~
    - ~~axon backend~~
    - ~~Rename "BallAndStick"~~

- ~~Select & test 5 good basic ion channels~~

- ~~Consolidate frontend~~
    - ~~dendrite frontend!~~

- ~~Synapses~~
    - ~~Create connections from axon??~~
    - ~~Voltage etc~~

- AC current
    - ~~backend params~~
    - ~~frequency gradient~~
    - ~~Handle float/zero oscillations~~
    - ~~uncomment exception handling~~
    - ~~try paper stuff~~

- Recordings
    - ~~Stimulus currents~~
        - ~~Name stimuli~~
    - ~~Ion concentrations~~
    - ~~Ion currents~~
    - ~~Voltage in other sections~~
        - ~~Neurons all one color & label~~
    - ~~chart ylabel~~
    - ~~Get chart labels dynamically~~
    - NC spikes
    - ~~Spiking in general~~
    - Cleanup chart function
    

- Segment level

- Neuron editor

- Changing ion concentrations

- Jo notes

- Push & prepare examples

- Ion channels
    - How granular

- Stims
    - ~~Choose segment & section~~
    - ~~Choose stimulus type~~
    - ~~Alternating current~~
    - Step current
    - stimulus names (and preview)
    - Representation in minimap

- Neurons
    - pre-specified neurons
    - ~~Multiple dendrites~~
    - ~~edit axon~~
    - ~~channel density~~
    - nseg
    - all dendrites as one
    - neurotransmitters
    - point processes
    - global variables (e.g. kbath)
        - Push to simulation tab?

- Simulation
    - temperature
    - update interval
    - Custom recordings
    - performance
    - incremental for long stretches
    - compress vectors?
    - implement reset

Views
    - ~~1 color per neuron~~
    - ~~plotLabels~~
    - ~~axisLabels~~
    - ~~Fix x-axis t~~
    - ~~Fix Dend V recordings~~
    - LFP summation
    - spike portraits
        - Better tooltips
        - Gridlines
    - heatmap for neuron
    - by-dendrite heatmaps
    - Phase portraits
    - Heatmaps
    - Viz popout
    - save/download plots
    - plot multiple values in one view


- Connections
    - Refactor connection code
    - More types of synapse
    - Connection Matrix

- Recording
    - Impedance

- General
    - User accounts
    - localise dependencies


- expand/minimize monitor/config

- Read & implement papers

Sources
-------

- Read NEURON book!
    - https://neuron.yale.edu/ftp/ted/book/revisions/chap10indexedref.pdf

- nrn utils:
    - https://bitbucket.org/apdavison/nrnutils/src/default/nrnutils.py

My First Neuron
- https://senselab.med.yale.edu/modeldb/ShowModel?model=3808&file=/MyFirstNEURON/manual.htm#tabs-2


- Synapses
    - https://senselab.med.yale.edu/modeldb/ShowModel?model=18197&file=/Neural_Computation/demo_gaba_neuralcomputation.oc#tabs-2
    - https://senselab.med.yale.edu/modeldb/ShowModel?model=18198&file=/SYN_NEW/ampa.hoc#tabs-2

- Calcium, Kinetics
    - https://www.compneuroprinciples.org/code-examples/all/all

- Expanding NEURON
    - https://www.neuron.yale.edu/neuron/static/papers/nc2000/nmodl400.pdf

- IC genealogy
    - https://icg.neurotheory.ox.ac.uk/viewer/2


Questions
---------
- How to generate rhytmic behaviour in single neuron
    - Increasing Na conductance seems to work
    - Constant IClamp doesn't

- How to simulate application of neurotransmitter
    - 

- Axon parameters
    - any channels? Myelination?

- Synapses
    - Which to use for connections
    - One synapse per connection?
    - All synapses the same for source?

- Papers
    - How to implement Hutcheon & Yarom

- sections
    - All equal? Privilege soma? Soma/axon/dendrites? Others?


========
Later
----

- Robustness
    - Enforce unique GIDS
    - Better error handling on keys being passed to backend
        - e.g. title key from stimulus
    - Prevent delete soma
    - tests
    - Multiple AC clamps on one neuron

- Layout
    - ~~Harmonize Stimulus and Neuron CSS~~
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
    - select, copy and paste objects in canvas
    - Timestamp notifications

- Refactoring
    - Move neuron template outside app
    - Generate config item sections from data
    - Ensure unique (HTML) IDs
    - move connections to models.py
    - Reuse bezier drawing code
    - Deal with multiple synapses in same loc
    - v-for connections
    - move sim save/load params into a dict
    - organize functions
    - documentation
    - Fix dendrite gid settings!
    - Mechanism classes
    - Mechanism data 
    - Separate data from help/title/step

- Features
    - rename neurons
    - reaction diffusion
    - neuromorpho db
    - custom ion channels
    - introduce some randomness?

- Goals
    - Insert modeldb url and it pings, compiles, and runs
    - channel library with descriptions and parameters you can search through



Notes
-----

Getting nrnivmodl to work on ubuntu required installing libx11-dev

Installing on Ubuntu server

https://www.neuron.yale.edu/neuron/download/compile_linux

downloaded tars from 
`https://neuron.yale.edu/ftp/neuron/versions/alpha/`
(iv-19; nrn-7.7.2)

cloned to `~/software`
required 8g swapfile: /mnt/8g.swap

`./configure --with-iv --with-paranrn --with-nrnpython=/home/cameron/camrobjones/camrobjones/bin/python3`

`sudo /home/cameron/camrobjones/camrobjones/bin/python3 setup.py install`

