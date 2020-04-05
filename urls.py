"""Spyke URL configurations"""

from django.urls import path
from spyke import views


app_name = 'spyke'
urlpatterns = [
    path('', views.interface),
    path('simulation', views.simulation)
]
