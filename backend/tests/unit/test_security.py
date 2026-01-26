"""Unit tests for security module."""
from __future__ import annotations

from datetime import timedelta

import pytest

from app.core.security import (
    TokenDecodeError,
    TokenPayload,
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


class TestPasswordHashing:
    """Tests for password hashing and verification."""

    def test_get_password_hash_returns_hash(self):
        """Test that get_password_hash returns a hashed password."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert hashed.startswith("$2b$")  # bcrypt prefix

    def test_get_password_hash_different_for_same_password(self):
        """Test that hashing same password twice produces different hashes (due to salt)."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Test that verify_password returns True for correct password."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test that verify_password returns False for incorrect password."""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_empty_password(self):
        """Test verification with empty password."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password("", hashed) is False


class TestJWTTokens:
    """Tests for JWT token creation and decoding."""

    def test_create_access_token_basic(self):
        """Test creating a basic access token."""
        token = create_access_token(subject="123", scope="staff")
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_claims(self):
        """Test creating access token with additional claims."""
        token = create_access_token(
            subject="123",
            scope="staff",
            school_id=1,
            role="admin",
        )
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_custom_expiry(self):
        """Test creating access token with custom expiry."""
        token = create_access_token(
            subject="123",
            scope="staff",
            expires_delta=timedelta(hours=2),
        )
        
        assert isinstance(token, str)

    def test_decode_access_token_valid(self):
        """Test decoding a valid access token."""
        token = create_access_token(
            subject="123",
            scope="staff",
            school_id=1,
            role="admin",
        )
        
        payload = decode_access_token(token)
        
        assert isinstance(payload, TokenPayload)
        assert payload.sub == "123"
        assert payload.scope == "staff"
        assert payload.school_id == 1
        assert payload.role == "admin"

    def test_decode_access_token_invalid(self):
        """Test that decoding invalid token raises TokenDecodeError."""
        with pytest.raises(TokenDecodeError):
            decode_access_token("invalid.token.here")

    def test_decode_access_token_tampered(self):
        """Test that decoding tampered token raises TokenDecodeError."""
        token = create_access_token(subject="123", scope="staff")
        # Tamper with the token
        tampered_token = token[:-5] + "xxxxx"
        
        with pytest.raises(TokenDecodeError):
            decode_access_token(tampered_token)

    def test_decode_access_token_empty(self):
        """Test that decoding empty token raises TokenDecodeError."""
        with pytest.raises(TokenDecodeError):
            decode_access_token("")

    def test_token_roundtrip_student_scope(self):
        """Test token roundtrip with student scope."""
        token = create_access_token(
            subject="456",
            scope="student",
            school_id=2,
        )
        
        payload = decode_access_token(token)
        
        assert payload.sub == "456"
        assert payload.scope == "student"
        assert payload.school_id == 2
        assert payload.role is None
