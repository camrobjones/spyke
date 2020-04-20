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




Roadmap
-------

Planned features include:

- Create multiple neurons and connect them via axons.
- Save and download plots
- Save and load simulations
- Multiple stimulus types
- Plot multiple voltages at once