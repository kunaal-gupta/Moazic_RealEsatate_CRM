from django.shortcuts import render


def home(request):
    return render(request, 'crm/home.html')


def leads(request):
    return render(request, 'crm/leads.html')


def pipeline(request):
    return render(request, 'crm/pipeline.html')


def contacts(request):
    return render(request, 'crm/contacts.html')


def properties(request):
    return render(request, 'crm/properties.html')


def showings(request):
    return render(request, 'crm/showings.html')


def tasks(request):
    return render(request, 'crm/tasks.html')


def emails(request):
    return render(request, 'crm/email.html')


def settings_page(request):
    return render(request, 'crm/settings.html')
