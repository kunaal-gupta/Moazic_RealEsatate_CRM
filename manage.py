#!/usr/bin/env python
"""Convenience manage.py so `python manage.py ...` works from repo root."""
import os
import sys
from pathlib import Path


def main() -> None:
    backend_dir = Path(__file__).resolve().parent / 'backend'
    sys.path.insert(0, str(backend_dir))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
