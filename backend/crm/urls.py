from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('contacts/', views.contacts, name='contacts'),
    path('deals/', views.deals, name='deals'),
    path('pipeline/', views.deals, name='pipeline'),
    path('leads/', views.leads, name='leads'),
    path('properties/', views.properties, name='properties'),
    path('showings/', views.showings, name='showings'),
    path('tasks/', views.tasks, name='tasks'),
    path('email/', views.emails, name='email'),
    path('settings/', views.settings_page, name='settings'),
]
