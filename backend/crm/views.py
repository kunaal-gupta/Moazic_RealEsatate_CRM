from django.conf import settings
from django.shortcuts import redirect


def _frontend(path: str = ''):
    base = settings.FRONTEND_DEV_URL.rstrip('/')
    page = path.lstrip('/')
    target = f'{base}/{page}' if page else f'{base}/'
    return redirect(target)


def home(request):
    return _frontend('')


def dashboard(request):
    return _frontend('dashboard')


def contacts(request):
    return _frontend('contacts')


def deals(request):
    return _frontend('deals')


def leads(request):
    return _frontend('leads')


def properties(request):
    return _frontend('properties')


def showings(request):
    return _frontend('showings')


def tasks(request):
    return _frontend('tasks')


def emails(request):
    return _frontend('email')


def settings_page(request):
    return _frontend('settings')
