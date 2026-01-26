"""Unit tests for configuration module."""
from __future__ import annotations

import pytest

from app.core.config import Settings, settings


class TestSettings:
    """Tests for application settings."""

    def test_settings_has_required_fields(self):
        """Test that settings has all required fields."""
        assert hasattr(settings, "database_url")
        assert hasattr(settings, "app_name")
        assert hasattr(settings, "secret_key")
        assert hasattr(settings, "jwt_algorithm")
        assert hasattr(settings, "access_token_expire_minutes")
        assert hasattr(settings, "data_dir_path")
        assert hasattr(settings, "backend_url")
        assert hasattr(settings, "uploads_dir_path")

    def test_settings_default_app_name(self):
        """Test the default app name."""
        assert settings.app_name == "Driving Quiz API"

    def test_settings_default_jwt_algorithm(self):
        """Test the default JWT algorithm."""
        assert settings.jwt_algorithm == "HS256"

    def test_settings_default_token_expiry(self):
        """Test the default token expiry time."""
        assert settings.access_token_expire_minutes == 60

    def test_settings_instance_creation(self):
        """Test creating a new Settings instance with custom values."""
        custom_settings = Settings(
            database_url="postgresql://custom:pass@localhost:5432/testdb",
            app_name="Custom App",
            secret_key="custom-secret",
            jwt_algorithm="HS512",
            access_token_expire_minutes=120,
        )
        
        assert custom_settings.database_url == "postgresql://custom:pass@localhost:5432/testdb"
        assert custom_settings.app_name == "Custom App"
        assert custom_settings.secret_key == "custom-secret"
        assert custom_settings.jwt_algorithm == "HS512"
        assert custom_settings.access_token_expire_minutes == 120
