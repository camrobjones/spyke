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
from pprint import pprint

import numpy as np
from neuron import h, nrn, load_mechanisms
from neuron.units import ms, mV

from spyke import glial
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

# Stimulus parameters
TEMPORAL_RESOLUTION = 10  # frames per ms
BUFFER = 5  # ms of 0 current to prevent interpolation errors

"""
Global variables
"""
# MECHANISM
# h.oinf_cagk = 1
# h.tau_cagk = 2
# vrat_cadifus = h.vrat_cadifus
# vrat_cadifus[3] = 0.5
# h.vrat_cadifus = vrat_cadifus


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


def alternating_current(amp_min, amp_max, dur, delay, freq0, freq1=None):
    """
    Create an sin wave from amp_min to amp_max at freq0 for dur ms

    returns tuple(t_vec, amp_vec)
        t_vec (h.Vector) time vector
        amp_vec (h.Vector) vector of amplitude values

    """

    # TODO: Prevent rounding of oscillations, period

    if freq1 is None:
        freq1 = freq0

    # convert freq to ms
    freq0 = freq0 / 1000
    freq1 = freq1 / 1000

    # Find mean freq, period, and no. oscillations
    freq_mean = np.mean([freq0, freq1])
    period_mean = 1/freq_mean
    dur = int(dur)
    oscillations = int(dur / period_mean)

    # gradient from freq0 to freq1
    freqs = np.linspace(freq0, freq1, oscillations)
    # pad to circumvent rounding down
    freqs = np.append(freqs, freqs[-1])

    # create sin wave
    pi_vals = np.array([])
    for freq in freqs:
        period = int((1/freq) * TEMPORAL_RESOLUTION)  # no. frames
        pi_vals = np.append(pi_vals, np.linspace(0, 2 * np.pi, period))

    vals = np.sin(pi_vals)[:dur * TEMPORAL_RESOLUTION]

    # add buffer time to prevent interpolation errors
    vals = np.append(vals, np.zeros(BUFFER * TEMPORAL_RESOLUTION))
    # add delay zeros at beginning
    vals = np.append(np.zeros(int(delay) * TEMPORAL_RESOLUTION), vals)

    # normalize current
    amp_diff = amp_max - amp_min
    vals = (vals + 1) / 2  # normalize between 0 and 1
    vals = vals * amp_diff  # normalize between 0 and amp_diff
    vals = vals + amp_min  # normalize between amp_min and amp_max

    # create time vector
    dur = dur + BUFFER  # add buffer time to prevent interpolation errors
    t_vec = h.Vector(np.linspace(0, int(delay) + dur + BUFFER, len(vals)))
    amp_vec = h.Vector(vals)

    return t_vec, amp_vec


class ACClamp():
    """
    Wrapper for h.IClamp with alternating current

    Parameters
    ----------

    """
    def __init__(self, seg, name, delay, amp_min, amp_max, dur, freq0, freq1=None):
        self.name = name
        self.stim = h.IClamp(seg)
        self.t_vec, self.amp_vec = alternating_current(amp_min, amp_max, dur,
                                                       delay, freq0, freq1)
        self.stim.dur = dur
        self.stim.delay = delay
        self.amp_vec.play(self.stim._ref_amp, self.t_vec, 1)

        self.records = {}
        self.records['i'] = h.Vector().record(self.stim._ref_i)
        self.records['amp'] = h.Vector().record(self.stim._ref_amp)


class Stimulus():
    """
    Helper class to create nrn Point Processes

    """
    def __init__(self, seg, stim_type, name, **params):
        self.name = name
        self.stim = getattr(h, stim_type)(seg)
        for k, v in params.items():
            setattr(self.stim, k, v)

        self.records = {}
        self.records['i'] = h.Vector().record(self.stim._ref_i)
        self.records['amp'] = h.Vector().record(self.stim._ref_amp)


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

        self.records = {}

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
        self.records['spikes'] = self.spiketimes

    def _setup_recording(self):
        self.records['v'] = h.Vector().record(self(0.5)._ref_v)
        data = self.psection()
        for ion, vals in data['ions'].items():
            # loop through current and internal concentration
            for key in [f"i{ion}", f"{ion}i"]:
                if key in vals:
                    ref = getattr(self(0.5), f"_ref_{key}")
                    self.records[key] = h.Vector().record(ref)
        self.record_spikes()


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
        self.name = params.get('name', f"Neuron {gid}")
        self.stimuli = []
        self.syns = []
        self.data = {}
        self.sections = {}
        self.vectors = []

        logger.info('setting up morphology')
        # Setup morphology and biophysics
        self._setup_morphology()
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
        # self.data['soma_v'] = self.soma.records['v']

        # Spike times
        # self.soma.record_spikes()
        # self.data['spike_times'] = self.soma.spiketimes

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
    def records(self):
        """Format and return recording data."""

        data = self.data

        for name, sec in self.sections.items():
            for key, record in sec.records.items():
                cell_record = data.get(key, {})
                cell_record[name] = glial.compress_array(record.as_numpy())
                data[key] = cell_record

        #  Reorganize spike times to one-hot time format
        # TODO: Move to sections. Property?
        # spike_times = data['spike_times'].to_python()
        # time = glial.compress_array(np.array(data['t']), frmt=None)
        # spikes = np.zeros(len(time))
        # for spike in spike_times:
        #     closest = np.argmin(abs(time - spike))
        #     spikes[closest] = 1

        # recordings = {
            # "Spike Times": list(spikes),
            # "Soma voltage": glial.compress_array(data['soma_v'].to_python()),
            # "cai": data['cai'].to_python(),
            # "cao": data['cao'].to_python(),
            # "ica": data['ica'].to_python(),
            # "ik": data['ik'].to_python(),
            # "ina": data['ina'].to_python(),
            # "ek": data['ek'].to_python(),
            # "ena": data['ena'].to_python(),
            # "Dendrite voltage": data['dend_v'].to_python(),
            # "Synapse current": data['syn_i'].to_python()
            # }
        return data


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

    def _setup_recording(self):
        """Instruct sections to create recordings"""
        # TODO: Definitely consolidate section setup into one function.
        # Makes sense so we can enforce order
        for sec in self.sections.values():
            sec._setup_recording()


    def getSection(self, section):
        """Return a section of the cell using a string key"""
        if section in ['soma', 'axon']:
            sec = self.__getattribute__(section)
        elif section.startswith('dendrite-'):
            index = int(section[9:]) - 1
            sec = self.dendrites[index]
        return sec

    def add_stimulus(self, section, loc, stim_type, name, parameters):
        """Add a new Point Process to the cell.

        Parameters
        ----------
        section : h.Section
            section to add stim
        loc : float
            Location on section to add stim
        stim_type: str
            Name of h.PointProcess or helper class
        params : kwargs
            Parameters for stim type

        """
        sec = self.getSection(section)
        seg = sec(loc)

        if stim_type == "ACClamp":
            stim = ACClamp(seg, name, **parameters)

        else:
            stim = Stimulus(seg, stim_type, name, **parameters)

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

    @property
    def stimuli(self):
        stims = []
        for cell in self.cells:
            stims += cell.stimuli
        return stims

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
            data[mech] = glial.get_mech_globals(mech)

        # for gid, cell in self.cells.items():
            # pprint(cell.soma.psection())

        h.continuerun(runtime * ms)

        # for gid, cell in self.cells.items():
            # pprint(cell.soma.psection())

    def add_connection(self, source, target, delay, weight, threshold,
                       section, loc, tau, e):
        """Add a connection to the model"""
        # Get target section
        sec = target.getSection(section)
        # Add synapse
        syn = h.ExpSyn(sec(loc))
        syn.tau = tau * ms
        syn.e = e
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
        timevec = glial.compress_array(self.timevec.as_numpy())
        # time = [round(tp) for tp in timevec]
        time = timevec
        output['t'] = time

        # Output spikes TODO
        output['nc_spikes'] = []
        for nc_spike in self.nc_spikes:
            output['nc_spikes'].append(nc_spike.to_python())

        # Views
        views = {}
        amp = {}
        for gid, cell in self.cells.items():
            for key, record in cell.records.items():
                sim_record = views.get(key, {})
                sim_record[cell.name] = record
                views[key] = sim_record

            cell_stims = {}
            for i, stim in enumerate(cell.stimuli):
                rec = glial.compress_array(stim.records['amp'].as_numpy())
                cell_stims[stim.name] = rec
            amp[cell.name] = cell_stims

        views['amp'] = amp

        # amp = {}
        # for stim in self.stimuli:
        #     stim_record = {}
        #     stim_record[stim.name] = stim.records['amp']
        #     amp[stim.name] = stim_record
        # views['amp'] = amp

        output['views'] = views
        return output
