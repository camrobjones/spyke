"""Spyke URL configurations"""

from django.urls import path
from spyke import views


app_name = 'spyke'
urlpatterns = [
    path('', views.interface),
    path('simulation', views.simulation),
    path('save', views.save_simulation),
    path('load', views.load_simulation),
    path('get_saved', views.saved_files)
]
