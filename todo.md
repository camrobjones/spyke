
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

- Cleanup backend
    - ~~Section classes~~
    - ~~axon backend~~
    - ~~Rename "BallAndStick"~~

- ~~Select & test 5 good basic ion channels~~

- Consolidate frontend
    - dendrite frontend!

- Track ion concentration

- Synapses
    - Create connections from axon??
    - Voltage etc

- Segment level

- Neuron editor


- global variables (e.g. kbath)
    - Push to simulation tab?

- Changing ion concentrations

- Jo notes

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

- Ion channels
    - How granular

- Qs
    - Interface usability


- Fix viz

- Stims
    - ~~Choose segment & section~~
    - Choose stimulus type
    - Rhythmic/repeated stimulation
    - Representation in minimap
    - Alternating current

- Neurons
    - pre-specified neurons
    - ~~Multiple dendrites~~
    - ~~edit axon~~
    - custom ion channels
    - ~~channel density~~
    - nseg
    - all dendrites as one

- Simulation
    - temperature
    - update interval
    - Custom recordings
    - performance
    - incremental for long stretches
    - compress vectors?

- Recording
    - Impedance

- General
    - User accounts


- expand/minimize monitor/config

- Read & implement papers

- Read NEURON book!
    - https://neuron.yale.edu/ftp/ted/book/revisions/chap10indexedref.pdf

- nrn utils:
    - https://bitbucket.org/apdavison/nrnutils/src/default/nrnutils.py

Views
    - ~~1 color per neuron~~
    - Fix Dend V recordings
    - LFP summation
    - spike portraits
    - Phase portraits
    - Heatmaps
    - Viz popout


Questions
---------
- Interneurons
    - When I do negative weights I get very strange negative voltages.
    - Is this expected?

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

- Papers
    - How to implement Hutcheon & Yarom


========
Later

- Robustness
    - Enforce unique GIDS
    - Better error handling on keys being passed to backend
    - Prevent delete soma

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

- Features
    - rename neurons
    - reaction diffusion
    - neuromorpho db
    - connectivity matrix

- Goals
    - Insert modeldb url and it pings, compiles, and runs
    - channel library with descriptions and parameters you can search through



- plotLabels
- axisLabels

- logging
- implement reset

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


