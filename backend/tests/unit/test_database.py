"""Unit tests for database module."""
from __future__ import annotations

import pytest

from app.core.database import _build_async_url, ASYNC_DATABASE_URL


class TestBuildAsyncUrl:
    """Tests for database URL conversion."""

    def test_convert_postgresql_to_psycopg(self):
        """Test converting postgresql:// to postgresql+psycopg://."""
        url = "postgresql://user:pass@localhost:5432/db"
        result = _build_async_url(url)
        
        assert result == "postgresql+psycopg://user:pass@localhost:5432/db"

    def test_preserve_existing_psycopg_url(self):
        """Test that existing psycopg URL is not modified."""
        url = "postgresql+psycopg://user:pass@localhost:5432/db"
        result = _build_async_url(url)
        
        assert result == url

    def test_preserve_url_with_options(self):
        """Test converting URL with query parameters."""
        url = "postgresql://user:pass@localhost:5432/db?sslmode=require"
        result = _build_async_url(url)
        
        assert result == "postgresql+psycopg://user:pass@localhost:5432/db?sslmode=require"

    def test_non_postgresql_url_unchanged(self):
        """Test that non-postgresql URLs are unchanged."""
        url = "mysql://user:pass@localhost:3306/db"
        result = _build_async_url(url)
        
        assert result == url

    def test_async_database_url_is_set(self):
        """Test that ASYNC_DATABASE_URL is properly set."""
        assert ASYNC_DATABASE_URL is not None
        assert isinstance(ASYNC_DATABASE_URL, str)
        assert "psycopg" in ASYNC_DATABASE_URL
