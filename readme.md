# Spyke — An interactive neuron modelling tool

Spyke is an interactive web tool for modelling neurons, recording and plotting results.

The package is written to be run as a django web app and is written in Python and Javascript.

The python makes use of the Yale NEURON project as a backend.

The site is hosted [here](https://camrobjones.com/spyke).

Features
--------

- Customize neuron biophysics, including length, diameter, leak channels and HH dynamics.
- Add clamp stimuli to simulations to explore responses from neurons.
- Set simulation parameters including time and membrane potential.
- Run simulations asynchronously in the browser.
- Plot voltage, current, and action potentials.
- Drag and drop neurons on a scalable, pannable 2d map.

Update: 20th Apr 2020

- Create multiple neurons
- Edit axon parameters
- Add multiple dendrites
- Attach stimulus to specific section and location of neuron
- Connect neurons to each other
    - Specify section and location of synapse on target neuron
- Plot multiple neurons in different colors
- More compact design of config options

Update: 4th May 2020

- Multiple ion channels
    - Choose from a selection of ion channels for each section
- New Visualizations
    - Visualize ion currents and concentrations
    - Visualise voltage of all sections in separate traces
    - New spike visualization
    - Visualize amperage of current from stimuli 
- Alternating current clamps.
    - Set frequency or gradient from one frequency to another.
- Set Equilibrium potential of synaptic connections
    - Allows for effectively inhibitory connections
- Save and load simulations



Roadmap
-------

Planned features include:

- Neuron editor
    - Save and load neuron templates
    - Create hierarchical dendrite parent-child relationships
    - Segment-level control of diameter and ion channel densities
    - Accurate visual representation of neuron parameters

- Connectivity
    - Connectivity Matrix
    - Multiple types of synapses

- Ion channels
    - More choice
    - Better organization
    - Neurotransmitter mediated processes
    - Eventually custom ion channels which create NMODL files

- Visualizations
    - Customize visualizations bringing arbitrary pieces of data together
    - Save data from previous runs to plot together (e.g. temperature from different simulations)
    - Save and download plots
    - LFP summation
    - Heatmaps

- Voltage and SE clamp stimuli
