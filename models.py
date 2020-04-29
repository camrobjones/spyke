"""
Neuron models
-------------
General purpose classes for modelling neurons.

The classes are heavily based on the NEURON tutorial:
https://neuron.yale.edu/neuron/docs/ball-and-stick-model-part-1

Update: the classes are now heavily based on Andrew P. Davison's nrnutils
https://bitbucket.org/apdavison/nrnutils/src/default/nrnutils.py
"""

import logging
import json
from pprint import pprint

import numpy as np
from neuron import h, nrn, load_mechanisms
from neuron.units import ms, mV
h.load_file('stdrun.hoc')

load_mechanisms('spyke/data/models/')

logger = logging.getLogger('django')

"""
Constants
---------
"""
# Section location shortcuts
PROXIMAL = 0
DISTAL = 1


"""
Global variables
"""
# MECHANISM
# h.oinf_cagk = 1
# h.tau_cagk = 2
# vrat_cadifus = h.vrat_cadifus
# vrat_cadifus[3] = 0.5
# h.vrat_cadifus = vrat_cadifus


def get_mech_globals(mechname, var=-1):
    ms = h.MechanismStandard(mechname, var)
    name = h.ref('')
    mech_globals = {}
    for j in range(ms.count()):
        ms.name(name, j)
        mech_globals[name[0]] = getattr(h, name[0])
    return mech_globals


def mech_global_params(outfile="spyke/static/spyke/globalparams.json"):
    """Create dict of all global parameters"""
    data = {}
    for mech in ['cagk', 'hh2', 'CaT', 'kd', 'kext', 'cadifus']:
        data[mech] = get_mech_globals(mech)
    if outfile:
        with open(outfile) as f:
            json.dump(data, f, indent=4)
    return data


class Mechanism(object):
    """
    Examples:
    >>> leak = Mechanism('pas', {'e': -65, 'g': 0.0002})
    >>> hh = Mechanism('hh')
    """
    def __init__(self, name, **parameters):
        self.name = name
        self.parameters = parameters

    def insert_into(self, section):
        """Insert self into all segs of section"""
        section.insert(self.name)
        for name, value in self.parameters.items():
            for segment in section:
                mech = getattr(segment, self.name)
                setattr(mech, name, value)


class Section(nrn.Section):
    """
    Examples:
    >>> soma = Section(L=30, diam=30, mechanisms=[hh, leak])
    >>> apical = Section(L=600, diam=2, nseg=5, mechanisms=[leak],
    ...                  parent=soma, connection_point=DISTAL)
    """
    def __init__(self, name="", L=100, diam=10, nseg=1, Ra=100, cm=1,
                 mechanisms=None, parent=None, connection_point=DISTAL,
                 cell=None):
        nrn.Section.__init__(self, name=name, cell=cell)
        self.name = name
        self.set_geometry(L, diam, nseg)
        # set cable properties
        self.Ra = Ra
        self.cm = cm
        # connect to parent section
        if parent:
            self.connect(parent, connection_point, PROXIMAL)
        # add ion channels
        mechanisms = mechanisms or []
        for mechanism in mechanisms:
            mechanism.insert_into(self)

    def set_geometry(self, L, diam, nseg):
        # set geometry
        self.L = L
        self.diam = diam
        self.nseg = nseg

    def add_synapses(self, label, type, locations=[0.5], **parameters):
        if hasattr(self, label):
            raise Exception("Can't overwrite synapse labels (to keep things simple)")
        synapse_group = []
        for location in locations:        
            synapse = getattr(h, type)(location, sec=self)
            for name, value in parameters.items():
                setattr(synapse, name, value)
            synapse_group.append(synapse)
        if len(synapse_group) == 1:
            synapse_group = synapse_group[0]
        setattr(self, label, synapse_group)
    add_synapse = add_synapses  # for backwards compatibility

    def record_spikes(self, threshold=-30):
        self.spiketimes = h.Vector()
        self.spikecount = h.APCount(0.5, sec=self)
        self.spikecount.thresh = threshold
        self.spikecount.record(self.spiketimes)


class Cell(object):

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
        self.data = {}
        self.sections = {}

        logger.info('setting up morphology')
        # Setup morphology and biophysics
        self._setup_morphology()
        logger.info('xxx')
        self.all = self.soma.wholetree()
        logger.info('setting up biophysics')
        self._setup_biophysics()

        logger.info('setting position')
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
        # Time
        self.data['t'] = h.Vector().record(h._ref_t)
        # Soma Voltage
        self.data['soma_v'] = h.Vector().record(self.soma(0.5)._ref_v)
        # self.data['ik'] = h.Vector().record(self.soma(0.5)._ref_ik)
        # self.data['ina'] = h.Vector().record(self.soma(0.5)._ref_ina)
        # self.data['ek'] = h.Vector().record(self.soma(0.5)._ref_ek)
        # self.data['ena'] = h.Vector().record(self.soma(0.5)._ref_ena)
        # self.data['cai'] = h.Vector().record(self.soma(0.5)._ref_cai)
        # self.data['i'] = h.Vector().record(self.soma(0.5)._ref)
        # self.data['ica'] = h.Vector().record(self.soma(0.5)._ref_ica)
        # self.data['cao'] = h.Vector().record(self.soma(0.5)._ref_cao)
        # Spike times
        self.soma.record_spikes()
        self.data['spike_times'] = self.soma.spiketimes

    def __repr__(self):
        return '{}[{}]'.format(self.name, self._gid)

    def __getattribute__(self, attr):
        """Allow dot notation access to sections"""
        return object.__getattribute__(self, attr)
             # self.sections.get(attr, )

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
            # "cai": data['cai'].to_python(),
            # "cao": data['cao'].to_python(),
            # "ica": data['ica'].to_python(),
            # "ik": data['ik'].to_python(),
            # "ina": data['ina'].to_python(),
            # "ek": data['ek'].to_python(),
            # "ena": data['ena'].to_python(),
            # "Dendrite voltage": data['dend_v'].to_python(),
            # "Synapse current": data['syn_i'].to_python()
            }
        return recordings


class SimpleNeuron(Cell):
    """Simple neuron with a soma and one dendrite."""

    def name_sec(self):
        """To be improved"""
        return f"section-{len(self.sections) + 1}"

    def _add_section(self, params, parent=None):
        # TODO: flexible defaults
        length = params.get('L', 12.6157)
        diam = params.get('diam', 12.6157)
        nseg = params.get('nseg', 1)
        name = params.get('name', self.name_sec())

        sec = Section(name=name, L=length, diam=diam, nseg=nseg,
                      parent=parent, cell=self)

        self.sections[name] = sec

        return sec

    def _add_channels(self, sec_name, sec_params=None):
        # TODO: move to sec or merge with Mechanism
        logger.info('adding channels for %s', sec_name)
        if sec_params is None:
            sec_params = self.params.get(sec_name, {})
        sec = self.sections[sec_name]
        for channel in sec_params.get("channels", []):
            sec.insert(channel["name"])
            for seg in sec:
                mech = seg.__getattribute__(channel["name"])
                for param in channel.get("parameters", []):
                    setattr(mech, param["name"], param["value"])
                for (k, v) in channel.get("assigned", {}).items():
                    setattr(mech, k, v)
                for (k, v) in channel.get("ions", {}).items():
                    setattr(seg, k, v)

    def _setup_morphology(self):
        # soma
        logger.info('setting up soma')
        soma_params = self.params.get('soma', {})
        soma_params['name'] = 'soma'  # TODO: Check elsewhere
        self.soma = self._add_section(soma_params)

        # axon
        logger.info('setting up axon')
        axon_params = self.params.get('axon', {})
        axon_params['name'] = 'axon'
        self.axon = self._add_section(axon_params, self.soma)

        # dendrites
        dend_params = self.params.get('dendrites', [])
        self.dendrites = []
        for dend in dend_params:
            dend['name'] = f"dendrite-{dend['gid']}"
            logger.info('setting up %s', dend['name'])
            dendrite = self._add_section(dend, self.soma)
            self.dendrites.append(dendrite)

    def _setup_biophysics(self):
        # Retrieve param dicts if provided
        # TODO: move all to sections variable
        params = self.params.get('general', {})

        for sec in self.all:
            sec.Ra = params.get('Ra', 100)
            sec.cm = params.get('cm', 1)

        for sec in self.sections.keys():
            self._add_channels(sec)

        # TODO: avoid doing dendrite separately!
        dend_params = self.params.get('dendrites', [])
        for dend in dend_params:
            name = f"dendrite-{dend['gid']}"
            self._add_channels(name, dend)


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
        data = {}
        for mech in ['cagk', 'hh2', 'CaT', 'kd', 'kext', 'cadifus']:
            data[mech] = get_mech_globals(mech)

        # for gid, cell in self.cells.items():
            # pprint(cell.soma.psection())

        h.continuerun(runtime * ms)

        # for gid, cell in self.cells.items():
            # pprint(cell.soma.psection())

    def add_connection(self, source, target, delay, weight, threshold,
                       section, loc, tau):
        """Add a connection to the model"""
        # Get target section
        sec = target.getSection(section)
        # Add synapse
        syn = h.ExpSyn(sec(loc))
        syn.tau = tau * ms
        target.syns.append(syn)

        nc = h.NetCon(source.axon(1)._ref_v, syn, sec=source.axon)
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
