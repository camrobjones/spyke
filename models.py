"""
Neuron models
-------------
General purpose classes for modelling neurons.

The classes are heavily based on the NEURON tutorial:
https://neuron.yale.edu/neuron/docs/ball-and-stick-model-part-1
"""

import logging

import numpy as np
from neuron import h
from neuron.units import ms, mV
h.load_file('stdrun.hoc')

logger = logging.getLogger('django')


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

        logger.info('creating cell %s', gid)

        # Initialise basic and default attributes
        self.params = params or {}
        self._gid = gid
        self.name = None
        self.stimuli = []
        self.syns = []

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
        self.axon = None
        self.dendrites = []
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
        # data['soma_v_0'] = h.Vector().record(self.soma(0)._ref_v)
        # data['soma_v_1'] = h.Vector().record(self.soma(1)._ref_v)

        # Dendrite Voltage
        for dend in self.dendrites:
            data[f'{dend.name}_v'] = h.Vector().record(dend(0.5)._ref_v)
        # data['dend_v_0'] = h.Vector().record(self.dend(0)._ref_v)
        # data['soma_v_1'] = h.Vector().record(self.dend(1)._ref_v)

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
            # "Dendrite voltage": data['dend_v'].to_python(),
            "Synapse current": data['syn_i'].to_python()
            }
        return recordings


class BallAndStick(Cell):
    """Simple neuron with a soma and one dendrite."""
    name = 'BallAndStick'

    def _setup_morphology(self):
        self.soma = h.Section(name='soma', cell=self)
        self.axon = h.Section(name='axon', cell=self)
        self.dendrites = []

        # soma
        soma_params = self.params.get('soma', {})
        self.soma.L = soma_params.get('L', 12.6157)
        self.soma.diam = soma_params.get('diam', 12.6157)

        # axon
        axon_params = self.params.get('axon', {})
        self.axon.L = axon_params.get('L', 200)
        self.soma.diam = axon_params.get('diam', 1)

        # dendrites
        dend_params = self.params.get('dendrites', [])
        for dend in dend_params:
            dendrite_name = f"dend-{dend['gid']}"
            dendrite = h.Section(name=dendrite_name, cell=self)
            dendrite.L = dend.get('L', 200)
            dendrite.diam = dend.get('diam', 1)
            dendrite.connect(self.soma)
            self.dendrites.append(dendrite)

    def _setup_biophysics(self):
        # Retrieve param dicts if provided
        params = self.params.get('general', {})
        soma_params = self.params.get('soma', {})
        dend_params_all = self.params.get('dendrites', {})
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
        for i in range(len(self.dendrites)):
            dendrite = self.dendrites[i]
            dend_params = dend_params_all[i]
            dendrite.insert('pas')
            for seg in dendrite:
                seg.pas.g = dend_params.get('g', 0.001)
                seg.pas.e = dend_params.get('e', -65)

        # Insert Synapse
        self.syn = h.ExpSyn(self.soma(0.5))
        tau = syn_params.get('tau', 2)
        self.syn.tau = tau * ms

    def getSection(self, section):
        """Return a section of the cell using a string key"""
        if section in ['soma', 'axon']:
            sec = self.__getattribute__(section)
        elif section.startswith('dendrite-'):
            index = int(section[9:]) - 1
            sec = self.dendrites[index]
        return sec

    def add_stimulus(self, section, loc, delay, dur, amp):
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
        sec = self.getSection(section)
        stim = h.IClamp(sec(loc))
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
        self.cells = cells or {}
        self.timevec = h.Vector().record(h._ref_t)
        self.ncs = []
        self.nc_spikes = []
        logger.info("simulation cells: : %s", self.cells)

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

    def add_connection(self, source, target, delay, weight, threshold,
                       section, loc, tau):
        """Add a connection to the model"""
        # Get target section
        sec = target.getSection(section)
        # Add synapse
        syn = h.ExpSyn(sec(loc))
        syn.tau = tau * ms
        target.syns.append(syn)

        nc = h.NetCon(source.soma(0.5)._ref_v, syn, sec=source.soma)
        nc.weight[0] = weight
        nc.delay = delay
        nc.threshold = threshold
        nc_spike = h.Vector()
        nc.record(nc_spike)
        self.nc_spikes.append(nc_spike)

        self.ncs.append(nc)

    @property
    def output(self):
        """Format output of simulation for plotting"""
        output = {}
        time = [round(tp) for tp in self.timevec.to_python()]
        output['t'] = time
        recordings = {}
        output['nc_spikes'] = []
        for nc_spike in self.nc_spikes:
            output['nc_spikes'].append(nc_spike.to_python())

        for gid, cell in self.cells.items():
            logger.info("output cell gid: : %s", gid)
            recordings[gid] = cell.recordings
        output['cells'] = recordings
        return output
