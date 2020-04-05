"""
Spyke Django Views
------------------
Functions to return HTML and JSON data to clients
"""

import json

from django.shortcuts import render
from django.http import JsonResponse

from spyke.models import BallAndStick, Simulation


def _decode(o):
    """Helper function to decode JSON floats and ints as numeric"""
    if isinstance(o, str):
        # First attempt to parse as float
        try:
            return float(o)
        except ValueError:
            # Then try int
            try:
                return int(o)
            except ValueError:
                # Then accept string
                return o
    elif isinstance(o, dict):
        return {k: _decode(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [_decode(v) for v in o]
    else:
        return o


# Asynchronous data views


def simulation(request):
    """
    Run a simulation and return results as a JSON
    """
    post = json.loads(request.body.decode('utf-8'), object_hook=_decode)

    # Retrieve simulation parameters
    time = post.get('time', 25)
    potential = post.get('potential', -65)

    # Create neuron
    parameters = post['neuron']
    cell = BallAndStick(0, 0, 0, 0, 0, parameters)

    # Create stimuli
    stimuli = post.get('stimuli', [])
    for stimulus in stimuli:
        cell.add_stimulus(**stimulus)

    # Run simulation
    sim = Simulation([cell])
    sim.run(runtime=time, potential=potential)

    # Return results as JSON
    return JsonResponse(sim.output)


def interface(request):
    """Main interface view"""
    return render(request, 'spyke/interface.html')
