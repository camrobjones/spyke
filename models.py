"""
Neuron models
-------------
General purpose classes for modelling neurons.

The classes are heavily based on the NEURON tutorial:
https://neuron.yale.edu/neuron/docs/ball-and-stick-model-part-1
"""

import numpy as np
from neuron import h
from neuron.units import ms, mV
h.load_file('stdrun.hoc')


class Cell:

    """General purpose class to model neurons

    Parameters
    ----------
    gid : int
        Unique identifier for the cell  TODO: generate from class
    x : numeric
        x co-ordinate of the cell's location
    y : numeric
        y co-ordinate of the cell's location
    z : numeric
        z co-ordinate of the cell's location
    theta : numeric
        Angle through which cell is rotated
    params : dict
        Optional biophysical and morphological parameters to specify
        cell features
    """

    def __init__(self, gid, x, y, z, theta, params=None):
        """Initiates the cell instance."""

        # Initialise basic and default attributes
        self.params = params or {}
        self._gid = gid
        self.name = None
        self.stimuli = []

        # Setup morphology and biophysics
        self._setup_morphology()
        self.all = self.soma.wholetree()
        self._setup_biophysics()

        # set position of cell
        self.x = self.y = self.z = 0
        h.define_shape()
        self._rotate_z(theta)
        self._set_position(x, y, z)

        self._setup_recording()

    def _setup_morphology(self):
        """Placeholder method"""
        self.soma = None
        self.dend = None
        self.syn = None

    def _setup_biophysics(self):
        """Placeholder method"""
        pass

    def _setup_recording(self):
        """Create recording variables for the cell"""
        data = {}

        # Time
        data['t'] = h.Vector().record(h._ref_t)

        # Spike detenction
        self._spike_detector = h.NetCon(
            self.soma(0.5)._ref_v, None, sec=self.soma)
        spike_times = h.Vector()
        self._spike_detector.record(spike_times)
        data['spike_times'] = spike_times

        # NetCons
        self._ncs = []

        # Soma Voltage
        data['soma_v'] = h.Vector().record(self.soma(0.5)._ref_v)
        data['soma_v_0'] = h.Vector().record(self.soma(0)._ref_v)
        data['soma_v_1'] = h.Vector().record(self.soma(1)._ref_v)

        # Dendrite Voltage
        data['dend_v'] = h.Vector().record(self.dend(0.5)._ref_v)
        data['dend_v_0'] = h.Vector().record(self.dend(0)._ref_v)
        data['soma_v_1'] = h.Vector().record(self.dend(1)._ref_v)

        # Synapse Current
        data['syn_i'] = h.Vector().record(self.syn._ref_i)

        self.data = data

    def __repr__(self):
        return '{}[{}]'.format(self.name, self._gid)

    def _set_position(self, x, y, z):
        """Set the cell's 3d position in space."""
        for sec in self.all:
            for i in range(sec.n3d()):
                sec.pt3dchange(i,
                               x - self.x + sec.x3d(i),
                               y - self.y + sec.y3d(i),
                               z - self.z + sec.z3d(i),
                               sec.diam3d(i))
        self.x, self.y, self.z = x, y, z

    def _rotate_z(self, theta):
        """Rotate the cell about the Z axis."""
        for sec in self.all:
            for i in range(sec.n3d()):
                x = sec.x3d(i)
                y = sec.y3d(i)
                c = h.cos(theta)
                s = h.sin(theta)
                xprime = x * c - y * s
                yprime = x * s + y * c
                sec.pt3dchange(i, xprime, yprime, sec.z3d(i), sec.diam3d(i))

    @property
    def recordings(self):
        """Format and return recording data."""

        data = self.data

        #  Reorganize spike times to one-hot time format
        spike_times = data['spike_times'].to_python()
        time = np.array(data['t'])
        spikes = np.zeros(len(time))
        for spike in spike_times:
            closest = np.argmin(abs(time - spike))
            spikes[closest] = 1

        recordings = {
            "Spike Times": list(spikes),
            "Soma voltage": data['soma_v'].to_python(),
            "Dendrite voltage": data['dend_v'].to_python(),
            "Synapse current": data['syn_i'].to_python()
            }
        return recordings


class BallAndStick(Cell):
    """Simple neuron with a soma and one dendrite."""
    name = 'BallAndStick'

    def _setup_morphology(self):
        self.soma = h.Section(name='soma', cell=self)
        self.dend = h.Section(name='dend', cell=self)
        self.dend.connect(self.soma)
        soma_params = self.params.get('soma', {})
        dend_params = self.params.get('dend', {})
        self.soma.L = soma_params.get('L', 12.6157)
        self.soma.diam = soma_params.get('diam', 12.6157)
        self.dend.L = dend_params.get('L', 200)
        self.dend.diam = dend_params.get('diam', 1)

    def _setup_biophysics(self):
        # Retrieve param dicts if provided
        params = self.params.get('general', {})
        soma_params = self.params.get('soma', {})
        dend_params = self.params.get('dend', {})
        syn_params = self.params.get('synapse', {})

        for sec in self.all:
            sec.Ra = params.get('Ra', 100)
            sec.cm = params.get('cm', 1)

        # Insert Hodgkin-Huxley kinetics
        self.soma.insert('hh')
        for seg in self.soma:
            seg.hh.gnabar = soma_params.get('gnabar', 0.12)
            seg.hh.gkbar = soma_params.get('gkbar', 0.036)
            seg.hh.gl = soma_params.get('gl', 0.0003)
            seg.hh.el = soma_params.get('el', -54.3)

        # Insert passive current in the dendrite
        self.dend.insert('pas')
        for seg in self.dend:
            seg.pas.g = dend_params.get('g', 0.001)
            seg.pas.e = dend_params.get('e', -65)

        # Insert Synapse
        self.syn = h.ExpSyn(self.dend(0.5))
        tau = syn_params.get('tau', 2)
        self.syn.tau = tau * ms

    def add_stimulus(self, delay, dur, amp):
        """Add a new Point Process to the cell.

        Parameters
        ----------
        delay : int
            Time before stimulus onset (ms)
        dur : int
            Time which stimulus lasts for
        amp : float
            Amplitude of stimulus (nA)

        """
        stim = h.IClamp(self.dend(1))
        stim.get_segment()

        stim.delay = delay
        stim.dur = dur
        stim.amp = amp

        self.stimuli.append(stim)


class Simulation:
    """Class to run and record a simulation of multiple cells.

    Attributes
    ----------
    cells : list of Cell objects
        Cells to be run in the simulation.
    """

    def __init__(self, cells=None):
        """Initialises simulation"""
        self.cells = cells or []
        self.timevec = h.Vector().record(h._ref_t)

    def run(self, potential=-65, runtime=25):
        """Run the simulation

        Parameters
        ----------
        potential : int, optional
            Resting membrane potential (mV)
        runtime : int, optional
            Time for simulation to run in ms
        """
        h.finitialize(potential * mV)
        h.continuerun(runtime * ms)

    @property
    def output(self):
        """Format output of simulation for plotting"""
        output = {}
        time = [round(tp) for tp in self.timevec.to_python()]
        output['t'] = time
        for cell in self.cells:
            output[cell._gid] = cell.recordings
        return output
