from django.http import JsonResponse


def _page(name: str) -> JsonResponse:
    return JsonResponse({'page': name, 'status': 'ok'})


def home(request):
    return _page('homepage')


def leads(request):
    return _page('leads')


def pipeline(request):
    return _page('pipeline')


def contacts(request):
    return _page('contacts')


def properties(request):
    return _page('properties')


def showings(request):
    return _page('showings')


def tasks(request):
    return _page('tasks')


def emails(request):
    return _page('email')


def settings_page(request):
    return _page('settings')
