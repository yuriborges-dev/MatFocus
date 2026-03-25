from django.contrib import admin
from .models import Content, Level, Phase, Question

admin.site.register(Content)
admin.site.register(Level)
admin.site.register(Phase)
admin.site.register(Question)