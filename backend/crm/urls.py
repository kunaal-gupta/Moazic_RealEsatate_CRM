from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('leads/', views.leads, name='leads'),
    path('pipeline/', views.pipeline, name='pipeline'),
    path('contacts/', views.contacts, name='contacts'),
    path('properties/', views.properties, name='properties'),
    path('showings/', views.showings, name='showings'),
    path('tasks/', views.tasks, name='tasks'),
    path('email/', views.emails, name='email'),
    path('settings/', views.settings_page, name='settings'),
]
