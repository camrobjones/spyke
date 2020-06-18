"""
Database Models
---------------
Models to save in the db with django
"""

import os
import json

from django.db import models


"""
Constants
"""
SIMULATION_DIR = os.path.join(os.getcwd(), 'spyke/data/simulations/')


class SimConfig(models.Model):
    """Save simulation config as JSON"""
    name = models.CharField(max_length=128, unique=True)
    datafile = models.FilePathField(path='spyke/data/simulations/')
    created = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)

    def set_datafile(self):
        """Construct filepast to save data from name"""
        self.datafile = os.path.join(SIMULATION_DIR, self.name + '.json')

    def save_config(self, config):
        """Save config in json file"""
        with open(self.datafile, 'w') as f:
            json.dump(config, f)
        return True

    def load_config(self):
        """Get config from json file"""
        with open(self.datafile) as f:
            data = json.load(f)
        return data
