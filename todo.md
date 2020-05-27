# Todo

Next up
-------


- PUSH


- Check NiA Simulations
- 201 Notes



- Connectivity Matrix

- Lara neuro stuff
    - Hyperpolarization .. cation current
    - H-current

- Write up report

- Tutorials


- Fix vix toggle line
- Spike viz colors
- Amplitude plot
- Stop plots from relying on Soma




Categorized
-----------

### Bugs
- showMenu bug

### Neuroscience
- Check NiA simulations
- G-proteins (2)
- Plasticity (STDP) (3)

- ING network
    - change leak conductance
    - should change osciallation frequency

### Tutorials
- Tutorial interface (2)
- Inhibition of synaptic potential (3)

### Stimuli

- Exist on canvas (2)
- Refactor
    - Classes
    - Create -> new
- Fix AC period algorithm
- Step current
- stimulus names (and preview)
- Representation in minimap

### Neurons

- point processes (1)
- Represent in canvas (2)
    - edit 
    - move
    - top-right box
- pre-specified neurons (3)
- neurotransmitters (3)
- Ion channels (3)
    - Assigned
    - Globals (e.g. kbath)
        - Push to simulation tab?

#### Neuron editor

- Remove sections (2)
- Channel suggest (2)
- Input width (2)
- Save/Load buttons (3)
- Hierarchical indenting
- Improve app.getSections

- Visual representation (3)
    - Match neuron data
    - Select
    - Create

### Simulation

(3)
- Changing ion concentrations
- update interval
- Custom recordings
- performance
- incremental for long stretches
- compress vectors?
- implement reset

### Views
- LFP summation
- spike portraits
    - Better tooltips
    - Gridlines
- heatmap for neuron
- by-dendrite heatmaps
- Phase portraits
- Heatmaps
- save/download plots
- plot multiple values in one view
- Axes min-max jQueryUI range slider
- get params from settings
- Reset on chart change
- Change colors


### Connections
- Chloride ion synapse (1)
- Connection Matrix (1)
- Draw on canvas (2)
- Refactor connection code
- More types of synapse


### Recording
- Impedance
    - https://www.neuron.yale.edu/phpBB/viewtopic.php?f=28&t=771

### General
- User accounts
- localise dependencies
- Grants/funding
    - Rapid
    - Eager
- Jo notes
- Lara: "A la carte"



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

- ModelDB
    - Kopell
    - "this is just a list of her submissions, the hippocampal theta/gamma looks interesting"
    - https://senselab.med.yale.edu/modeldb/author_matches.py?author=Kopell+N




Questions
---------

Dendrites:
    - Convention 1: d_1 for #n1
    - Convention 2: 0a, 0b, 0c by radial
        - children 0a_main_1a_ch
            - children: 0a_main_1a_ch_2a_ch

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

For Lara
--------
- Grants and funding
- Tutorials


========
Later
----

- Robustness
    - Enforce unique GIDS
    - Better error handling on keys being passed to backend
        - e.g. title key from stimulus
    - Prevent delete soma
    - tests
    - Validate params frontend

- Layout
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
    - reaction diffusion
    - neuromorpho db
    - custom ion channels
    - introduce some randomness?

- Goals
    - Insert modeldb url and it pings, compiles, and runs
    - channel library with descriptions and parameters you can search through
    - Generate the pulsing behaviour from Freeman/olfactory bulb in a CA.



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

