
Lara notes
----------
- G-protei

- Hyperpolarization .. cation current
- H-current

- Chloride ion

- Feed in spiking data

- Response to feedback over time

- Physiological properties of cells

- change defaults

Todo
----
- chart legend toggle other sections

- Segment level

- Neuron editor

- Changing ion concentrations

- Jo notes

- Push & prepare examples

- Ion channels
    - How granular

- Stims
    - Step current
    - stimulus names (and preview)
    - Representation in minimap

- Neurons
    - Represent in canvas
        - name
        - color
        - edit
    - pre-specified neurons
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
        - https://www.neuron.yale.edu/phpBB/viewtopic.php?f=28&t=771

- General
    - User accounts
    - localise dependencies
    - Grants/funding
        - Rapid
        - Eager


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

- Chloride channel
    - Which one to use?
    - Voltage gated..?

- Synapses
    - Which to use for connections
    - One synapse per connection?
    - All synapses the same for source?

- Axon parameters
    - any channels? Myelination?

- How to simulate application of neurotransmitter
    - GABAergic/ AMDA etc

- sections
    - All equal? Privilege soma? Soma/axon/dendrites? Others?

- Should viz show all segments? Mean or soma as opaque?

- How to generate rhytmic behaviour in single neuron
    - Increasing Na conductance seems to work
    - Constant IClamp doesn't

- Papers
    - How to implement Hutcheon & Yarom


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

