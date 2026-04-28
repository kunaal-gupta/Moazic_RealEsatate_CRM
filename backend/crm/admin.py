from django.contrib import admin

from . import models

MODELS_TO_REGISTER = [
    models.User,
    models.Property,
    models.Contact,
    models.PipelineStage,
    models.Pipeline,
    models.PipelineProperty,
    models.PipelineContact,
    models.PipelineHistory,
    models.Showing,
    models.ShowingProperty,
    models.ShowingParticipant,
    models.Lead,
    models.LeadStage,
    models.LeadHistory,
    models.LeadNote,
    models.EmailTemplate,
    models.Activity,
    models.Task,
    models.Email,
    models.Document,
]

for model in MODELS_TO_REGISTER:
    admin.site.register(model)
